import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import MemorystoreFactory from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  roles: string[];
  emailVerified: boolean;
};

const users = new Map<string, User>();
const refreshTokens = new Map<string, { userId: string; exp: number }>();

// demo user
const demoPassword = bcrypt.hashSync("DemoPassw0rd!", 10);
users.set("1", {
  id: "1",
  email: "admin@example.com",
  name: "Admin",
  passwordHash: demoPassword,
  roles: ["admin"],
  emailVerified: true,
});

const JWT_ACCESS_TTL = "10m";
const JWT_REFRESH_TTL_SEC = 60 * 60 * 24 * 7; // 7 days
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

passport.use(
  new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {
    const user = Array.from(users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return done(null, false, { message: "Invalid credentials" });
    if (!bcrypt.compareSync(password, user.passwordHash)) return done(null, false, { message: "Invalid credentials" });
    return done(null, user);
  })
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id: string, done) => {
  const user = users.get(id) || null;
  done(null, user);
});

export function configureAuth(app: express.Express) {
  const MemoryStore = MemorystoreFactory(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-session-secret",
      name: "sid",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 30, // 30 minutes
      },
      store: new MemoryStore({ checkPeriod: 1000 * 60 * 60 }),
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // CSRF demo token via header (simple double-submit token)
  app.use((req, _res, next) => {
    if (!req.session) return next();
    if (!req.session.csrfToken) req.session.csrfToken = Math.random().toString(36).slice(2);
    next();
  });
}

function signAccess(user: User) {
  return jwt.sign({ sub: user.id, email: user.email, roles: user.roles, scp: ["read", "write"] }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_TTL,
    audience: "web",
    issuer: "driveinsight-auth",
  });
}

function issueRefresh(user: User) {
  const jti = Math.random().toString(36).slice(2);
  const exp = Math.floor(Date.now() / 1000) + JWT_REFRESH_TTL_SEC;
  refreshTokens.set(jti, { userId: user.id, exp });
  return { token: jwt.sign({ sub: user.id, jti }, JWT_SECRET, { expiresIn: JWT_REFRESH_TTL_SEC }), jti, exp };
}

export function authRouter() {
  const router = express.Router();

  router.post("/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err, user: User, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Unauthorized" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        const access = signAccess(user);
        const { token: refresh } = issueRefresh(user);
        res.cookie("refresh", refresh, { httpOnly: true, sameSite: "lax", secure: false, path: "/api/auth" });
        return res.json({ access });
      });
    })(req, res, next);
  });

  router.post("/refresh", (req: Request, res: Response) => {
    const cookie = req.cookies?.refresh || req.body?.refresh;
    if (!cookie) return res.status(401).json({ message: "No refresh token" });
    try {
      const decoded: any = jwt.verify(cookie, JWT_SECRET);
      const meta = refreshTokens.get(decoded.jti);
      if (!meta || meta.userId !== decoded.sub) return res.status(401).json({ message: "Invalid refresh" });
      // rotate
      refreshTokens.delete(decoded.jti);
      const user = users.get(decoded.sub);
      if (!user) return res.status(401).json({ message: "Unknown user" });
      const access = signAccess(user);
      const { token: refresh } = issueRefresh(user);
      res.cookie("refresh", refresh, { httpOnly: true, sameSite: "lax", secure: false, path: "/api/auth" });
      return res.json({ access });
    } catch {
      return res.status(401).json({ message: "Invalid refresh" });
    }
  });

  router.post("/logout", (req: Request, res: Response) => {
    // clear refresh
    res.clearCookie("refresh", { path: "/api/auth" });
    if (req.user && req.session) {
      req.logout(() => {
        req.session?.destroy(() => {});
        res.json({ ok: true });
      });
    } else {
      res.json({ ok: true });
    }
  });

  return router;
}

export function requireSession(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated?.()) return next();
  return res.status(401).json({ message: "Session required" });
}

export function requireJwt(roles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) return res.status(401).json({ message: "Missing token" });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (roles && !roles.some((r) => decoded.roles?.includes(r))) return res.status(403).json({ message: "Forbidden" });
      (req as any).jwt = decoded;
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

