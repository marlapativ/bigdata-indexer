import database from '../config/database'
import { Model } from '../types/model'

/*
const PLAN_SCHEMA = 
{
  $schema: 'http://json-schema.org/draft-06/schema#',
  $ref: '#/definitions/Plan',
  definitions: {
    Plan: {
      type: 'object',
      additionalProperties: false,
      properties: {
        planCostShares: {
          $ref: '#/definitions/PlanCostShares'
        },
        linkedPlanServices: {
          type: 'array',
          items: {
            $ref: '#/definitions/LinkedPlanService'
          }
        },
        _org: {
          type: 'string'
        },
        objectId: {
          type: 'string'
        },
        objectType: {
          type: 'string'
        },
        planType: {
          type: 'string'
        },
        creationDate: {
          type: 'string'
        }
      },
      required: ['_org', 'creationDate', 'linkedPlanServices', 'objectId', 'objectType', 'planCostShares', 'planType'],
      title: 'Plan'
    },
    LinkedPlanService: {
      type: 'object',
      additionalProperties: false,
      properties: {
        linkedService: {
          $ref: '#/definitions/LinkedService'
        },
        planserviceCostShares: {
          $ref: '#/definitions/PlanCostShares'
        },
        _org: {
          type: 'string'
        },
        objectId: {
          type: 'string'
        },
        objectType: {
          type: 'string'
        }
      },
      required: ['_org', 'linkedService', 'objectId', 'objectType', 'planserviceCostShares'],
      title: 'LinkedPlanService'
    },
    LinkedService: {
      type: 'object',
      additionalProperties: false,
      properties: {
        _org: {
          type: 'string'
        },
        objectId: {
          type: 'string'
        },
        objectType: {
          type: 'string'
        },
        name: {
          type: 'string'
        }
      },
      required: ['_org', 'name', 'objectId', 'objectType'],
      title: 'LinkedService'
    },
    PlanCostShares: {
      type: 'object',
      additionalProperties: false,
      properties: {
        deductible: {
          type: 'integer'
        },
        _org: {
          type: 'string'
        },
        copay: {
          type: 'integer'
        },
        objectId: {
          type: 'string'
        },
        objectType: {
          type: 'string'
        }
      },
      required: ['_org', 'copay', 'deductible', 'objectId', 'objectType'],
      title: 'PlanCostShares'
    }
  }
}

*/

/*

MODIFIED PLAN SCHEMA

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Generated schema for Root",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "planCostShares": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "deductible": {
          "type": "number"
        },
        "_org": {
          "type": "string"
        },
        "copay": {
          "type": "number"
        },
        "objectId": {
          "type": "string"
        },
        "objectType": {
          "type": "string"
        }
      },
      "required": [
        "deductible",
        "_org",
        "copay",
        "objectId",
        "objectType"
      ]
    },
    "linkedPlanServices": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "linkedService": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "_org": {
                "type": "string"
              },
              "objectId": {
                "type": "string"
              },
              "objectType": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            },
            "required": [
              "_org",
              "objectId",
              "objectType",
              "name"
            ]
          },
          "planserviceCostShares": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "deductible": {
                "type": "number"
              },
              "_org": {
                "type": "string"
              },
              "copay": {
                "type": "number"
              },
              "objectId": {
                "type": "string"
              },
              "objectType": {
                "type": "string"
              }
            },
            "required": [
              "deductible",
              "_org",
              "copay",
              "objectId",
              "objectType"
            ]
          },
          "_org": {
            "type": "string"
          },
          "objectId": {
            "type": "string"
          },
          "objectType": {
            "type": "string"
          }
        },
        "required": [
          "linkedService",
          "planserviceCostShares",
          "_org",
          "objectId",
          "objectType"
        ]
      }
    },
    "_org": {
      "type": "string"
    },
    "objectId": {
      "type": "string"
    },
    "objectType": {
      "type": "string"
    },
    "planType": {
      "type": "string"
    },
    "creationDate": {
      "type": "string"
    }
  },
  "required": [
    "planCostShares",
    "linkedPlanServices",
    "_org",
    "objectId",
    "objectType",
    "planType",
    "creationDate"
  ]
}
*/

const PlanModel: Model = {
  schema: async () => await database.getDatabaseConnection().get('PLAN_SCHEMA'),
  key: 'PLAN'
}

export default PlanModel
