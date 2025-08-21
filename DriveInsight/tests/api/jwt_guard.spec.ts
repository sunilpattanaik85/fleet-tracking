import http from 'http'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../../../DriveInsight/server/routes'

let app: express.Express
let server: http.Server

beforeAll(async () => {
  app = express()
  app.use(express.json())
  server = await registerRoutes(app)
})

afterAll((done) => {
  server.close(done)
})

describe('JWT guard', () => {
  it('rejects delete without admin token', async () => {
    const res = await request(app).delete('/api/vehicles/V-001')
    expect([401, 403]).toContain(res.status)
  })
})

