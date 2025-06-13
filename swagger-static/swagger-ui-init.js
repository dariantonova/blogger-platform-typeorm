
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/api": {
        "get": {
          "operationId": "AppController_getHello",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "App"
          ]
        }
      },
      "/api/sa/users": {
        "get": {
          "operationId": "UsersControllerWrap_getUsers",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "UsersControllerWrap"
          ]
        },
        "post": {
          "operationId": "UsersControllerWrap_createUser",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "UsersControllerWrap"
          ]
        }
      },
      "/api/sa/users/{id}": {
        "delete": {
          "operationId": "UsersControllerWrap_deleteUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "UsersControllerWrap"
          ]
        }
      },
      "/api/auth/login": {
        "post": {
          "operationId": "AuthControllerWrap_login",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerWrap"
          ]
        }
      },
      "/api/auth/me": {
        "get": {
          "operationId": "AuthControllerWrap_me",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerWrap"
          ]
        }
      },
      "/api/auth/registration": {
        "post": {
          "operationId": "AuthControllerWrap_register",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerWrap"
          ]
        }
      },
      "/api/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthControllerWrap_resendRegistrationEmail",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationEmailResendingInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerWrap"
          ]
        }
      },
      "/api/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthControllerWrap_confirmRegistration",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationConfirmationCodeInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerWrap"
          ]
        }
      },
      "/api/auth/password-recovery": {
        "post": {
          "operationId": "AuthControllerWrap_recoverPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PasswordRecoveryInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerWrap"
          ]
        }
      },
      "/api/auth/new-password": {
        "post": {
          "operationId": "AuthControllerWrap_setNewPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/NewPasswordRecoveryInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerWrap"
          ]
        }
      },
      "/api/auth/refresh-token": {
        "post": {
          "operationId": "AuthControllerWrap_refreshToken",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerWrap"
          ]
        }
      },
      "/api/auth/logout": {
        "post": {
          "operationId": "AuthControllerWrap_logout",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerWrap"
          ]
        }
      },
      "/api/security/devices": {
        "get": {
          "operationId": "SecurityDevicesControllerWrap_getUserDeviceSessions",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "SecurityDevicesControllerWrap"
          ]
        },
        "delete": {
          "operationId": "SecurityDevicesControllerWrap_terminateAllOtherUserDeviceSessions",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "SecurityDevicesControllerWrap"
          ]
        }
      },
      "/api/security/devices/{deviceId}": {
        "delete": {
          "operationId": "SecurityDevicesControllerWrap_terminateDeviceSession",
          "parameters": [
            {
              "name": "deviceId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "SecurityDevicesControllerWrap"
          ]
        }
      },
      "/api/blogs": {
        "get": {
          "operationId": "BlogsControllerWrap_getBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsControllerWrap"
          ]
        }
      },
      "/api/blogs/{id}": {
        "get": {
          "operationId": "BlogsControllerWrap_getBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsControllerWrap"
          ]
        }
      },
      "/api/blogs/{blogId}/posts": {
        "get": {
          "operationId": "BlogsControllerWrap_getBlogPosts",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsControllerWrap"
          ]
        }
      },
      "/api/sa/blogs": {
        "get": {
          "operationId": "BlogsSaControllerWrap_getBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerWrap"
          ]
        },
        "post": {
          "operationId": "BlogsSaControllerWrap_createBlog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBlogInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerWrap"
          ]
        }
      },
      "/api/sa/blogs/{id}": {
        "get": {
          "operationId": "BlogsSaControllerWrap_getBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerWrap"
          ]
        },
        "put": {
          "operationId": "BlogsSaControllerWrap_updateBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateBlogInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerWrap"
          ]
        },
        "delete": {
          "operationId": "BlogsSaControllerWrap_deleteBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerWrap"
          ]
        }
      },
      "/api/sa/blogs/{blogId}/posts": {
        "get": {
          "operationId": "BlogsSaControllerWrap_getBlogPosts",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerWrap"
          ]
        },
        "post": {
          "operationId": "BlogsSaControllerWrap_createBlogPost",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBlogPostInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerWrap"
          ]
        }
      },
      "/api/sa/blogs/{blogId}/posts/{postId}": {
        "put": {
          "operationId": "BlogsSaControllerWrap_updateBlogPost",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateBlogPostInputDtoWrap"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerWrap"
          ]
        },
        "delete": {
          "operationId": "BlogsSaControllerWrap_deleteBlogPost",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerWrap"
          ]
        }
      },
      "/api/posts": {
        "get": {
          "operationId": "PostsControllerWrap_getPosts",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "PostsControllerWrap"
          ]
        }
      },
      "/api/posts/{id}": {
        "get": {
          "operationId": "PostsControllerWrap_getPost",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "PostsControllerWrap"
          ]
        }
      },
      "/api/posts/{postId}/comments": {
        "get": {
          "operationId": "PostsControllerWrap_getPostComments",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "PostsControllerWrap"
          ]
        },
        "post": {
          "operationId": "PostsControllerWrap_createPostComment",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostCommentInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "PostsControllerWrap"
          ]
        }
      },
      "/api/comments/{id}": {
        "get": {
          "operationId": "CommentsControllerWrap_getComment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "CommentsControllerWrap"
          ]
        },
        "put": {
          "operationId": "CommentsControllerWrap_updateComment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCommentInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "CommentsControllerWrap"
          ]
        },
        "delete": {
          "operationId": "CommentsControllerWrap_deleteComment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "CommentsControllerWrap"
          ]
        }
      },
      "/api/testing/all-data": {
        "delete": {
          "operationId": "TestingController_deleteAll",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Testing"
          ]
        }
      }
    },
    "info": {
      "title": "BLOGGER API",
      "description": "",
      "version": "1.0",
      "contact": {}
    },
    "tags": [],
    "servers": [],
    "components": {
      "securitySchemes": {
        "bearer": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http"
        }
      },
      "schemas": {
        "CreateUserInputDto": {
          "type": "object",
          "properties": {}
        },
        "RegistrationEmailResendingInputDto": {
          "type": "object",
          "properties": {}
        },
        "RegistrationConfirmationCodeInputDto": {
          "type": "object",
          "properties": {}
        },
        "PasswordRecoveryInputDto": {
          "type": "object",
          "properties": {}
        },
        "NewPasswordRecoveryInputDto": {
          "type": "object",
          "properties": {}
        },
        "CreateBlogInputDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateBlogInputDto": {
          "type": "object",
          "properties": {}
        },
        "CreateBlogPostInputDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateBlogPostInputDtoWrap": {
          "type": "object",
          "properties": {}
        },
        "CreatePostCommentInputDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateCommentInputDto": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
