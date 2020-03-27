define({ "api": [
  {
    "type": "post",
    "url": "/parties/",
    "title": "Création d'une partie",
    "name": "PostPartie",
    "group": "Paries",
    "parameter": {
      "fields": {
        "BODY": [
          {
            "group": "BODY",
            "type": "UUID",
            "optional": false,
            "field": "idSerie",
            "description": "<p>id de la série que l'utilisateur à séléctionner</p>"
          },
          {
            "group": "BODY",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>pseudo de l'utilisateur</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Partie",
            "optional": false,
            "field": "Partie",
            "description": "<p>information sur la nouvelle partie, avec son token de verification</p>"
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
            "field": "400",
            "description": "<p>L'username n'est pas renseigné</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>La série est introuvable</p>"
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
    "groupTitle": "Paries"
  },
  {
    "type": "put",
    "url": "/parties/:id",
    "title": "Mise à jour de la partie lorsqu'elle est terminé",
    "name": "EndGame",
    "group": "Parties",
    "header": {
      "fields": {
        "Authorization": [
          {
            "group": "Authorization",
            "type": "bearer",
            "optional": false,
            "field": "token",
            "description": "<p>token de la partie</p>"
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
            "field": "idSerie",
            "description": "<p>Id de la série que l'utilisateur à joué</p>"
          }
        ],
        "BODY": [
          {
            "group": "BODY",
            "type": "Boolean",
            "optional": false,
            "field": "end",
            "description": "<p>Indique si la partie est finit</p>"
          },
          {
            "group": "BODY",
            "type": "Number",
            "optional": false,
            "field": "score",
            "description": "<p>Score de la partie</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Partie",
            "optional": false,
            "field": "Partie",
            "description": "<p>Informations sur la partie</p>"
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
            "field": "404",
            "description": "<p>l'idSerie est incorrect</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>le token ne correspond pas à celui de la partie</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>le score est n'est pas dans le bon format</p>"
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
    "groupTitle": "Parties"
  },
  {
    "type": "get",
    "url": "/parties/:id/photos",
    "title": "Photos de la serie",
    "name": "getPhotos",
    "group": "Parties",
    "header": {
      "fields": {
        "Authorization": [
          {
            "group": "Authorization",
            "type": "bearer",
            "optional": false,
            "field": "token",
            "description": "<p>token de la partie</p>"
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
            "field": "idSerie",
            "description": "<p>Id de la série que l'utilisateur à choisi</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Photos",
            "optional": false,
            "field": "Photos",
            "description": "<p>Photos de la série</p>"
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
            "field": "400",
            "description": "<p>l'idSerie n'est pas renseigné</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>l'idSerie est incorrect</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>le token ne correspond pas à celui de la partie</p>"
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
    "groupTitle": "Parties"
  },
  {
    "type": "get",
    "url": "/parties/:id/series",
    "title": "Photos de la serie",
    "name": "getSerieByPartie",
    "group": "Parties",
    "header": {
      "fields": {
        "Authorization": [
          {
            "group": "Authorization",
            "type": "bearer",
            "optional": false,
            "field": "token",
            "description": "<p>token de la partie</p>"
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
            "field": "idPartie",
            "description": "<p>Id de la partie</p>"
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
            "description": "<p>Serie correspondant à la partie</p>"
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
            "field": "400",
            "description": "<p>l'idPartie n'est pas renseigné</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>l'idPartie est incorrect</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>le token ne correspond pas à celui de la partie</p>"
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
    "groupTitle": "Parties"
  },
  {
    "type": "get",
    "url": "/series/:id/classement",
    "title": "Photos de la serie",
    "name": "getSerieByPartie",
    "group": "Parties",
    "parameter": {
      "fields": {
        "URI": [
          {
            "group": "URI",
            "type": "UUID",
            "optional": false,
            "field": "idSerie",
            "description": "<p>Id de la serie</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Partie",
            "optional": false,
            "field": "Partie",
            "description": "<p>Parties correspondant à la série</p>"
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
            "field": "400",
            "description": "<p>l'idSerie n'est pas renseigné</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>l'idSerie est incorrect</p>"
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
    "groupTitle": "Parties"
  },
  {
    "type": "get",
    "url": "/series",
    "title": "Series",
    "name": "GetSeries",
    "group": "Series",
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
            "description": "<p>Liste de serie</p>"
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
  }
] });
