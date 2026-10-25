import type { Station, StationQuery, PageResult } from '../types/station'

// Mock 数据库
const mockData: Station[] = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  code: `ST-${String(i + 1).padStart(3, '0')}`,
  name: `测试工站 ${i + 1}`,
  lineArea: ['A', 'B', 'C'][i % 3] as any,
  status: i % 2 === 0 ? 'active' : 'inactive',
  remark: `备注信息 ${i + 1}`,
  createTime: new Date(Date.now() - Math.random() * 1e10).toISOString(),
  updateTime: new Date().toISOString()
}))

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getStations(query: StationQuery): Promise<PageResult<Station>> {
  await delay(300)
  let filtered = mockData.filter(item => {
    if (query.code && !item.code.toLowerCase().includes(query.code!.toLowerCase())) return false
    if (query.name && !item.name.includes(query.name!)) return false
    if (query.status && item.status !== query.status) return false
    return true
  })
  const total = filtered.length
  const start = (query.page - 1) * query.pageSize
  const list = filtered.slice(start, start + query.pageSize)
  return { list, total }
}

export async function addStation(station: Omit<Station, 'id' | 'createTime' | 'updateTime'>): Promise<Station> {
  await delay(300)
  const newId = mockData.length > 0 ? Math.max(...mockData.map(s => s.id!)) + 1 : 1
  const newStation: Station = { ...station, id: newId, createTime: new Date().toISOString(), updateTime: new Date().toISOString() }
  mockData.unshift(newStation)
  return newStation
}

export async function updateStation(station: Station): Promise<Station> {
  await delay(300)
  const idx = mockData.findIndex(s => s.id === station.id)
  if (idx !== -1) {
    mockData[idx] = { ...mockData[idx], ...station, updateTime: new Date().toISOString() }
    return mockData[idx]
  }
  throw new Error('Station not found')
}

export async function deleteStation(id: number): Promise<void> {
  await delay(200)
  const idx = mockData.findIndex(s => s.id === id)
  if (idx !== -1) mockData.splice(idx, 1)
}