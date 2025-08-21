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

describe('Session guard', () => {
  it('blocks create vehicle without session', async () => {
    const res = await request(app).post('/api/vehicles').send({
      id: 'V-999', driverName: 'Test', corridor: 'Beira', speed: 0, fuel: 100, status: 'active', vehicleType: 'truck', latitude: 0, longitude: 0
    })
    expect([401, 403]).toContain(res.status)
  })
})

