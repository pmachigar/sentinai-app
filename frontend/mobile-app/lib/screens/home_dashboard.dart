import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:animate_do/animate_do.dart';

class HomeDashboard extends StatefulWidget {
  const HomeDashboard({super.key});

  @override
  State<HomeDashboard> createState() => _HomeDashboardState();
}

class _HomeDashboardState extends State<HomeDashboard> {
  late IO.Socket socket;
  LatLng _vehiclePosition = const LatLng(-34.6037, -58.3816);
  
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;
  String _voiceCommand = "";

  @override
  void initState() {
    super.initState();
    _initWebSocket();
    _initSpeech();
  }

  void _initWebSocket() {
    socket = IO.io('http://localhost:3000', IO.OptionBuilder()
      .setTransports(['websocket'])
      .build());
      
    socket.onConnect((_) => debugPrint('Mobile WS Connected to Core API'));
    socket.on('telemetry_update', (data) {
      if (data['lat'] != null && data['lng'] != null) {
        setState(() {
          // Actualización de ubicación bidireccional vía MQTT/Kafka/Websocket
          _vehiclePosition = LatLng(data['lat'], data['lng']);
        });
      }
    });
  }

  void _initSpeech() async {
    await _speech.initialize();
  }

  void _listenToVoice() async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (val) => debugPrint('onStatus: $val'),
        onError: (val) => debugPrint('onError: $val'),
      );
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (val) => setState(() {
            _voiceCommand = val.recognizedWords;
            // Si el speech dictation ya cerró, se lo enviamos a Cognitive Agents
            if (val.finalResult) {
              _isListening = false;
              _sendCommandToAI(_voiceCommand);
            }
          }),
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }

  void _sendCommandToAI(String command) {
    // Aquí el NLP/Speech text se inyectaría al FastAPI (Cognitive Agents) -> RAG + Tactician Agent
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Comando dictado a la IA: "$command"'), 
        backgroundColor: Theme.of(context).colorScheme.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  void dispose() {
    socket.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Centro de Operaciones (SOC)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Paneles IoT de Domótica (Top)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildDomoticCard(Icons.lock, 'Cierre Defensivo', const Color(0xFFF472B6)), // Accent Pink
                _buildDomoticCard(Icons.lightbulb, 'Luminosidad Activa', Colors.amber),
                _buildDomoticCard(Icons.warning_amber, 'Modo Pánico', Colors.orange),
              ],
            ),
          ),
          
          const Divider(color: Colors.white24, height: 32),

          // Mapa Interactivo Flutter Map (Centro/Abajo)
          Expanded(
            child: Stack(
              children: [
                FlutterMap(
                  options: const MapOptions(
                    initialCenter: LatLng(-34.6037, -58.3816),
                    initialZoom: 13.0,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                      subdomains: const ['a', 'b', 'c', 'd'],
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: _vehiclePosition,
                          width: 40,
                          height: 40,
                          child: Pulse(
                            infinite: true,
                            child: const Icon(Icons.my_location, color: Color(0xFF38BDF8), size: 30),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                
                // Overlay de Speech a Text (Flotante y animado)
                if (_isListening)
                  Positioned(
                    bottom: 40,
                    left: 20,
                    right: 20,
                    child: FadeInUp(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.surface.withOpacity(0.95),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Theme.of(context).colorScheme.primary),
                          boxShadow: [
                             BoxShadow(color: Theme.of(context).colorScheme.primary.withOpacity(0.3), blurRadius: 15)
                          ]
                        ),
                        child: Text(_voiceCommand.isEmpty ? 'Escuchando tu dictamen táctico...' : 'Analizando: "$_voiceCommand"', 
                          style: const TextStyle(color: Colors.white, fontSize: 16), textAlign: TextAlign.center),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
      // Botón flotante central inferior 
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: FloatingActionButton(
        onPressed: _listenToVoice,
        backgroundColor: _isListening ? const Color(0xFFF472B6) : Theme.of(context).colorScheme.secondary,
        child: Icon(_isListening ? Icons.mic_off : Icons.mic, color: Colors.white),
      ),
    );
  }

  Widget _buildDomoticCard(IconData icon, String title, Color color) {
    return GestureDetector(
      onTap: () {
        // Toggle Logic para enviar a Core API -> MQTT
      },
      child: Container(
        width: 100,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: color.withOpacity(0.2), blurRadius: 8, spreadRadius: 1)
          ],
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(title, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
