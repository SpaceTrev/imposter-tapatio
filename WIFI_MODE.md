# Modo WiFi - Imposter Radar

## Cómo Funciona

El modo WiFi usa **PeerJS** para conexiones peer-to-peer (P2P) directas entre el anfitrión y los jugadores. No requiere servidor backend persistente.

## Configuración

### Anfitrión
1. Selecciona "Ser Anfitrión" en el modo WiFi
2. Se genera un código de sala único (ej: "ABC123")
3. Comparte este código con los jugadores
4. Espera a que se conecten los jugadores
5. Configura el juego:
   - Selecciona categoría (o deja aleatoria)
   - Elige número de impostores
   - Opción de dar pista al impostor
   - Opción de excluir contenido adulto
6. Presiona "Iniciar Juego"
7. Controla las revelaciones desde los botones:
   - **Revelar Impostores**: Notifica a todos los jugadores que el juego terminó
   - **Mostrar Palabra al Impostor**: Envía la palabra del impostor (si no tenía pista)

### Jugador
1. Selecciona "Unirse como Jugador"
2. Ingresa el código de sala compartido por el anfitrión
3. Ingresa tu nombre
4. Espera a que el anfitrión inicie el juego
5. Tu rol y palabra aparecerán en pantalla
6. Mantén el celular privado para no mostrar tu rol

## Arquitectura Técnica

### PeerJS
- Usa el servidor de señalización público de PeerJS (peerjs.com)
- Conexiones P2P directas entre navegadores
- No requiere servidor propio

### Flujo de Datos

1. **Anfitrión crea peer**: `imposter-{CODIGO}`
2. **Jugadores se conectan**: Al peer del anfitrión usando el código
3. **Handshake**:
   - Jugador envía: `{ type: "player-name", name: "..." }`
   - Anfitrión responde: `{ type: "connected", ... }`
4. **Inicio de juego**:
   - Anfitrión calcula roles y palabras
   - Envía a cada jugador: `{ type: "role-assignment", isImposter, word, ... }`
5. **Revelaciones**:
   - `{ type: "reveal-imposters" }` - Broadcast a todos
   - `{ type: "show-imposter-word", word }` - Solo a impostores

### Estados del Juego

**Anfitrión**:
- `setup`: Configurando juego, esperando jugadores
- `playing`: Juego en curso, controles de revelación activos

**Jugador**:
- Ingresando nombre
- Conectando al anfitrión
- Esperando inicio de juego
- Viendo rol y palabra

## Limitaciones Conocidas

1. **Firewall/NAT**: Algunas redes corporativas pueden bloquear conexiones P2P
2. **Sin persistencia**: Si el anfitrión se desconecta, el juego termina
3. **Dependencia de PeerJS**: Usa el servidor de señalización gratuito (puede tener límites)

## Mejoras Futuras

- [ ] Reconexión automática si se pierde conexión
- [ ] Múltiples rondas sin reiniciar conexiones
- [ ] Chat entre jugadores
- [ ] Votación para revelar impostores
- [ ] Servidor de señalización propio (mejor confiabilidad)

## Debugging

Abre la consola del navegador (F12) para ver logs de conexión:
- "Host peer opened with ID: ..." - Anfitrión listo
- "New player connecting: ..." - Jugador conectándose
- "Connected to host" - Jugador conectado exitosamente
