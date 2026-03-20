import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/onboarding_screen.dart';

void main() {
  runApp(
    // Envolvemos toda la App en ProviderScope para habilitar Riverpod
    const ProviderScope(
      child: SentinAIApp(),
    ),
  );
}

class SentinAIApp extends StatelessWidget {
  const SentinAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Definimos el Tema Global Dark elegante respetando el Glassmorph UI conceptual
    return MaterialApp(
      title: 'SentinAI Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A), 
        primaryColor: const Color(0xFF38BDF8), 
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF38BDF8),
          secondary: Color(0xFF818CF8),
          surface: Color(0xFF1E293B),
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
        useMaterial3: true,
      ),
      home: const OnboardingScreen(),
    );
  }
}
