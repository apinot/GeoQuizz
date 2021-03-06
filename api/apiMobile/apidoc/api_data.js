define({ "api": [
  {
    "type": "post",
    "url": "/photos",
    "title": "Listes des photos",
    "name": "AddPhotos",
    "group": "Photos",
    "header": {
      "fields": {
        "String": [
          {
            "group": "String",
            "type": "access-key",
            "optional": false,
            "field": "Users",
            "description": "<p>unique access-key.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Object": [
          {
            "group": "Object",
            "type": "Images",
            "optional": false,
            "field": "Liste",
            "description": "<p>original de photo</p>"
          },
          {
            "group": "Object",
            "type": "UUID",
            "optional": false,
            "field": "id",
            "description": "<p>de l'utilisateur</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Photo",
            "optional": false,
            "field": "Photo",
            "description": "<p>La photos ajoutée</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Authentification incorrecte</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500",
            "description": "<p>Problème avec la base de donnée</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>Pas de photo dans le body de la requete</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "Photos"
  },
  {
    "type": "put",
    "url": "/series/id/photos",
    "title": "Ajout de photo dans une series",
    "name": "AddPhotoToSeries",
    "group": "Series",
    "header": {
      "fields": {
        "String": [
          {
            "group": "String",
            "type": "access-key",
            "optional": false,
            "field": "Users",
            "description": "<p>unique access-key.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "BODY": [
          {
            "group": "BODY",
            "type": "Image",
            "optional": false,
            "field": "Image",
            "description": ""
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500",
            "description": "<p>Erreur interne</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>Pas de série trouver</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Pas autorisé à effectuer la requête</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>Mauvaise requête</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Series",
            "optional": false,
            "field": "La",
            "description": "<p>série modifié</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "Series"
  },
  {
    "type": "get",
    "url": "/series/id",
    "title": "Suppression Series",
    "name": "DeleteSeries",
    "group": "Series",
    "header": {
      "fields": {
        "String": [
          {
            "group": "String",
            "type": "access-key",
            "optional": false,
            "field": "Users",
            "description": "<p>unique access-key.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "URI": [
          {
            "group": "URI",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": ""
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Authentification incorrecte</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500",
            "description": "<p>Problème avec la base de donnée</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>Série non trouvé dans la base de donnée</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "String",
            "description": "<p>La série est supprimé</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "Series"
  },
  {
    "type": "put",
    "url": "/serie/:id",
    "title": "Edit Series",
    "name": "EditSerie",
    "group": "Series",
    "header": {
      "fields": {
        "String": [
          {
            "group": "String",
            "type": "access-key",
            "optional": false,
            "field": "Users",
            "description": "<p>unique access-key.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "URI": [
          {
            "group": "URI",
            "type": "UUID",
            "optional": false,
            "field": "id",
            "description": "<p>Id de la série</p>"
          }
        ],
        "BODY": [
          {
            "group": "BODY",
            "type": "Serie",
            "optional": false,
            "field": "Serie",
            "description": "<p>Serie à modifier</p>"
          },
          {
            "group": "BODY",
            "type": "Number",
            "optional": false,
            "field": "user",
            "description": "<p>Id de l'utilisateur</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Authentification incorrecte</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500",
            "description": "<p>Problème avec la base de donnée</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>Série non trouvé dans la base de donnée</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Serie",
            "optional": false,
            "field": "Serie",
            "description": "<p>La série édité</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "Series"
  },
  {
    "type": "get",
    "url": "/series",
    "title": "Liste Series",
    "name": "GetSeries",
    "group": "Series",
    "header": {
      "fields": {
        "String": [
          {
            "group": "String",
            "type": "access-key",
            "optional": false,
            "field": "Users",
            "description": "<p>unique access-key.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "QUERY": [
          {
            "group": "QUERY",
            "type": "String",
            "optional": false,
            "field": "limit",
            "description": "<p>valeur pour limité la récupération des série</p>"
          },
          {
            "group": "QUERY",
            "type": "String",
            "optional": false,
            "field": "offset",
            "description": "<p>valeur pour limité la récupération des série</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Series",
            "optional": false,
            "field": "Series",
            "description": "<p>Le nombre total de séries de l'utilisateur et la liste des séries à partir de offset (avec size element)</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500",
            "description": "<p>Erreur interne</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "Series"
  },
  {
    "type": "get",
    "url": "/series",
    "title": "Ajout Series",
    "name": "PostSeries",
    "group": "Series",
    "header": {
      "fields": {
        "String": [
          {
            "group": "String",
            "type": "access-key",
            "optional": false,
            "field": "Users",
            "description": "<p>unique access-key.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Serie",
            "optional": false,
            "field": "Serie",
            "description": "<p>La série édité</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Authentification incorrecte</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500",
            "description": "<p>Problème avec la base de donnée</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "Series"
  },
  {
    "type": "post",
    "url": "/utilisateurs/auth",
    "title": "Connexion de l'utilisateur",
    "name": "Connexion",
    "group": "Utilisateurs",
    "header": {
      "fields": {
        "Authorisation": [
          {
            "group": "Authorisation",
            "type": "basic",
            "optional": false,
            "field": "email:password",
            "description": "<p>Identifiants de connexion de l'utilisateur encodés en base64</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Utilisateur",
            "optional": false,
            "field": "Utilisateur",
            "description": "<p>L'utilisateur et son token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Authentification incorrecte</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500",
            "description": "<p>Erreur interne</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "Utilisateurs"
  }
] });
