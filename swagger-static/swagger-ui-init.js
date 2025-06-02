
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
          "operationId": "UsersControllerSql_getUsers",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "UsersControllerSql"
          ]
        },
        "post": {
          "operationId": "UsersControllerSql_createUser",
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
            "UsersControllerSql"
          ]
        }
      },
      "/api/sa/users/{id}": {
        "delete": {
          "operationId": "UsersControllerSql_deleteUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "UsersControllerSql"
          ]
        }
      },
      "/api/auth/login": {
        "post": {
          "operationId": "AuthControllerSql_login",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerSql"
          ]
        }
      },
      "/api/auth/me": {
        "get": {
          "operationId": "AuthControllerSql_me",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerSql"
          ]
        }
      },
      "/api/auth/registration": {
        "post": {
          "operationId": "AuthControllerSql_register",
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
            "AuthControllerSql"
          ]
        }
      },
      "/api/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthControllerSql_resendRegistrationEmail",
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
            "AuthControllerSql"
          ]
        }
      },
      "/api/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthControllerSql_confirmRegistration",
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
            "AuthControllerSql"
          ]
        }
      },
      "/api/auth/password-recovery": {
        "post": {
          "operationId": "AuthControllerSql_recoverPassword",
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
            "AuthControllerSql"
          ]
        }
      },
      "/api/auth/new-password": {
        "post": {
          "operationId": "AuthControllerSql_setNewPassword",
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
            "AuthControllerSql"
          ]
        }
      },
      "/api/auth/refresh-token": {
        "post": {
          "operationId": "AuthControllerSql_refreshToken",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerSql"
          ]
        }
      },
      "/api/auth/logout": {
        "post": {
          "operationId": "AuthControllerSql_logout",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "AuthControllerSql"
          ]
        }
      },
      "/api/security/devices": {
        "get": {
          "operationId": "SecurityDevicesControllerSql_getUserDeviceSessions",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "SecurityDevicesControllerSql"
          ]
        },
        "delete": {
          "operationId": "SecurityDevicesControllerSql_terminateAllOtherUserDeviceSessions",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "SecurityDevicesControllerSql"
          ]
        }
      },
      "/api/security/devices/{deviceId}": {
        "delete": {
          "operationId": "SecurityDevicesControllerSql_terminateDeviceSession",
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
            "SecurityDevicesControllerSql"
          ]
        }
      },
      "/api/comments/{id}": {
        "get": {
          "operationId": "CommentsController_getComment",
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
            "Comments"
          ]
        },
        "put": {
          "operationId": "CommentsController_updateComment",
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
            "Comments"
          ]
        },
        "delete": {
          "operationId": "CommentsController_deleteComment",
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
            "Comments"
          ]
        }
      },
      "/api/comments/{commentId}/like-status": {
        "put": {
          "operationId": "CommentsController_makeCommentLikeOperation",
          "parameters": [
            {
              "name": "commentId",
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
                  "$ref": "#/components/schemas/LikeInputDto"
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
            "Comments"
          ]
        }
      },
      "/api/sa/blogs": {
        "get": {
          "operationId": "BlogsSaControllerSql_getBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerSql"
          ]
        },
        "post": {
          "operationId": "BlogsSaControllerSql_createBlog",
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
            "BlogsSaControllerSql"
          ]
        }
      },
      "/api/sa/blogs/{id}": {
        "put": {
          "operationId": "BlogsSaControllerSql_updateBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
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
            "BlogsSaControllerSql"
          ]
        },
        "delete": {
          "operationId": "BlogsSaControllerSql_deleteBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerSql"
          ]
        }
      },
      "/api/sa/blogs/{blogId}/posts": {
        "get": {
          "operationId": "BlogsSaControllerSql_getBlogPosts",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerSql"
          ]
        },
        "post": {
          "operationId": "BlogsSaControllerSql_createBlogPost",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
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
            "BlogsSaControllerSql"
          ]
        }
      },
      "/api/sa/blogs/{blogId}/posts/{postId}": {
        "put": {
          "operationId": "BlogsSaControllerSql_updateBlogPost",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateBlogPostInputDtoSql"
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
            "BlogsSaControllerSql"
          ]
        },
        "delete": {
          "operationId": "BlogsSaControllerSql_deleteBlogPost",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "BlogsSaControllerSql"
          ]
        }
      },
      "/api/blogs": {
        "get": {
          "operationId": "BlogsControllerSql_getBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsControllerSql"
          ]
        }
      },
      "/api/blogs/{blogId}/posts": {
        "get": {
          "operationId": "BlogsControllerSql_getBlogPosts",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsControllerSql"
          ]
        }
      },
      "/api/blogs/{id}": {
        "get": {
          "operationId": "BlogsControllerSql_getBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "BlogsControllerSql"
          ]
        }
      },
      "/api/posts": {
        "get": {
          "operationId": "PostsControllerSql_getPosts",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "PostsControllerSql"
          ]
        }
      },
      "/api/posts/{id}": {
        "get": {
          "operationId": "PostsControllerSql_getPost",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "PostsControllerSql"
          ]
        }
      },
      "/api/posts/{postId}/comments": {
        "get": {
          "operationId": "PostsControllerSql_getPostComments",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "PostsControllerSql"
          ]
        },
        "post": {
          "operationId": "PostsControllerSql_createPostComment",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
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
            "PostsControllerSql"
          ]
        }
      },
      "/api/posts/{postId}/like-status": {
        "put": {
          "operationId": "PostsControllerSql_makePostLikeOperation",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeInputDto"
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
            "PostsControllerSql"
          ]
        }
      },
      "/api/sql/comments/{id}": {
        "get": {
          "operationId": "CommentsControllerSql_getComment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "CommentsControllerSql"
          ]
        },
        "put": {
          "operationId": "CommentsControllerSql_updateComment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
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
            "CommentsControllerSql"
          ]
        },
        "delete": {
          "operationId": "CommentsControllerSql_deleteComment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "CommentsControllerSql"
          ]
        }
      },
      "/api/sql/comments/{commentId}/like-status": {
        "put": {
          "operationId": "CommentsControllerSql_makeCommentLikeOperation",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeInputDto"
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
            "CommentsControllerSql"
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
        "UpdateCommentInputDto": {
          "type": "object",
          "properties": {}
        },
        "LikeInputDto": {
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
        "UpdateBlogPostInputDtoSql": {
          "type": "object",
          "properties": {}
        },
        "CreatePostCommentInputDto": {
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
