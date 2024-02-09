export interface Plan {
  planCostShares: PlanCostShares
  linkedPlanServices: LinkedPlanService[]
  _org: string
  objectId: string
  objectType: string
  planType: string
  creationDate: string
}

export type PlanCostShares = {
  deductible: number
  _org: string
  copay: number
  objectId: string
  objectType: string
}

export type LinkedPlanService = {
  linkedService: LinkedService
  planserviceCostShares: PlanserviceCostShares
  _org: string
  objectId: string
  objectType: string
}

export type LinkedService = {
  _org: string
  objectId: string
  objectType: string
  name: string
}

export type PlanserviceCostShares = {
  deductible: number
  _org: string
  copay: number
  objectId: string
  objectType: string
}
