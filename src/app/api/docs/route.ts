import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "Radhika Jewellers API Documentation",
      description: "Enterprise-grade luxury eCommerce platform API endpoints.",
      version: "1.0.0"
    },
    paths: {
      "/api/shop/products": {
        "get": {
          "summary": "Fetch storefront products",
          "description": "Returns list of products with filters, sorting, and pagination.",
          "parameters": [
            { "name": "category", "in": "query", "schema": { "type": "string" } },
            { "name": "minPrice", "in": "query", "schema": { "type": "number" } },
            { "name": "maxPrice", "in": "query", "schema": { "type": "number" } },
            { "name": "search", "in": "query", "schema": { "type": "string" } },
            { "name": "page", "in": "query", "schema": { "type": "integer" } },
            { "name": "limit", "in": "query", "schema": { "type": "integer" } }
          ],
          "responses": {
            "200": { "description": "Successful retrieval of product list" }
          }
        }
      },
      "/api/admin/settings": {
        "get": {
          "summary": "Retrieve admin settings",
          "responses": {
            "200": { "description": "All configurations list" },
            "401": { "description": "Unauthorized access" }
          }
        },
        "post": {
          "summary": "Update admin settings",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "settings": { "type": "object" },
                    "group": { "type": "string", "enum": ["general", "payment", "shipping", "seo"] }
                  }
                }
              }
            }
          },
          "responses": {
            "200": { "description": "Settings updated successfully" }
          }
        }
      },
      "/api/notifications/register-token": {
        "post": {
          "summary": "Register FCM device token",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "token": { "type": "string" },
                    "deviceType": { "type": "string" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": { "description": "Token registered successfully" }
          }
        }
      },
      "/api/health": {
        "get": {
          "summary": "Application health metrics",
          "responses": {
            "200": { "description": "Details of database connection and server memory" }
          }
        }
      }
    }
  };

  return NextResponse.json(openApiSpec);
}
export const dynamic = 'force-dynamic';
