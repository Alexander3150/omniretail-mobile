# Backend Integration

No hay backend real en esta etapa.

El flujo futuro sera:

```text
Screen
-> Hook
-> Application Service
-> Repository
-> Mock ahora / API futuro
```

`src/infrastructure/mock` alojara datos locales y repositorios mock cuando se habiliten. `src/infrastructure/storage` queda reservado para persistencia futura, sin AsyncStorage ni SecureStore todavia.
