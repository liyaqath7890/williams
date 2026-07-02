# Architecture Guide

AEGIS is split into an Express/Sequelize backend and a Vite React frontend. Backend modules use model, service, controller, and route layers. Frontend pages call backend APIs through `operationsService` and subscribe to Socket.IO events through `socketClient`.

Realtime domains include SOS, alerts, chat, resources, shelters, missing persons, notifications, assignments, tracking, read receipts, typing indicators, and offline queue flushes.
