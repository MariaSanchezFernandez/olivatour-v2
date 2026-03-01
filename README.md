# Instalación

Pasos de intalación

## 1. Archivo .env

Copiar el archivo ```.env.example``` a ```.env```

```
cp .env.example .env
```

## 2. Generar node_modules

```
npm install
```

## 3. Generar carpeta vendor

```
composer install
```

## 4. Generar APP_KEY (.env)

```
php artisan key:generate
```

## 5. Ejecutar proyecto

En una terminal ejecutamos:
```
npm run dev
```

En otra terminal **diferente**:
```
php artisan serve
```

## 6. Crear Base de Datos

```
php artisan migrate
```

## Rellenar bd

```
php artisan db:seed
```

O con:

```
php artisan migrate:fresh --seed
```





###########################
######## RUTAS API ########
###########################

$param puede ser tano el id del objeto de la tabla tamto como su nombre

COMARCAS

GET /comarcas          // Da una lista de todas las comarcas

GET /comarcas/{param}/poblaciones  // Lista de las poblaciones en una comarca

GET /comarcas/{param}/logros    // Lista de los logros de una comarca (de las poblacione y lugares que tiene)



POBLACIONES

GET /poblaciones  // lista de todas las poblaciones

GET /poblaciones/{param}/lugares  // Lista de los lugares en una poblacion

GET /poblaciones/{param}/logros  // Lista de los logros en una poblacion



LUGARES DE INTERÉS

GET /lugares // Lista de los lugares de interés

GET /lugares/{id}  //  Devuelve los detalles de un lugar específico.  ( se podrá usar param más adelante)



LOGROS

GET /logros   // Lista de logros

GET /logros{id} // datos de un logro especifico ( se podrá usar param más adelante)


////   ESTA INCOMPLETO, CUALQUIER RUTA QUE FALTE HACEDSELA SABER A LOS ENCARGADOS DE BACKEND   ////



## Usuarios

GET          api/user            // todos los usuarios registrados
GET          api/user/{user}     // usuarios que coincidan en el id o email
POST         api/user            // registra un usuario nuevo
PUT|PATCH    api/user/{user}     // actualiza un usuario si existe
DELETE       api/user/{user}     // elimina el usuario si existe

########################################################





# Peticiones API

## Usuarios

Funciona todo

### funciona
1. index
1. show
1. store
1. update
1. delete



## Comarcas

### funciona
1. index
1. store
1. update
1. delete
1. poblacionesDeUnaComarca
1. logrosDeUnaComarcaPorIdONombre

coger las medallas de cada comarca y también porcentaje

### no funciona
1. show



## Poblaciones

### funciona
1. index
1. show
1. getLugaresByPoblacion
1. getLugaresByPoblacion

### no funciona
1. store
1. update
1. delete


## Logros

### funciona
1. index
1. store
1. update
1. delete

### no funciona
1. show



## Puntos de interés

### funciona
1. index
1. show
1. store
1. delete

### no funciona
1. update






petición conseguir logros
cambiar una población a completada