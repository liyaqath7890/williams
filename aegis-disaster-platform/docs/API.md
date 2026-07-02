# AEGIS API Documentation

Base path: `/api/v1`. All protected endpoints require `Authorization: Bearer <accessToken>`.

## Reports
- `GET /reports?type=dashboard|incidents|volunteers|shelters|resources|missingPersons|analytics&from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /reports/export/csv`, `/reports/export/xlsx`, `/reports/export/pdf`

## Shelters
- `GET /shelters?search=&status=&page=&limit=`
- `POST /shelters`
- `PATCH /shelters/:id`
- `DELETE /shelters/:id`

## Resources
- `GET /resources?search=&category=&status=&page=&limit=`
- `POST /resources`
- `PATCH /resources/:id`
- `DELETE /resources/:id`

## Missing Persons
- `GET /missing-persons?search=&status=&page=&limit=`
- `POST /missing-persons`
- `PATCH /missing-persons/:id`
- `PATCH /missing-persons/:id/status`
- `DELETE /missing-persons/:id`

## Alerts, Uploads, Notifications
- `GET|POST /alerts`, `DELETE /alerts/:id`
- `GET /uploads`, `POST /uploads/single`, `DELETE /uploads/:id`
- `GET /notifications`, `PATCH /notifications/:id/read`, `DELETE /notifications/:id`, `PATCH /notifications/preferences`, `POST /notifications/broadcast`
