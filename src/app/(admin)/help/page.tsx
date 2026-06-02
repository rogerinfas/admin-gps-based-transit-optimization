'use client';

import PageShell from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Map, 
  Activity, 
  Zap, 
  BookOpen, 
  ChevronDown, 
  Mail, 
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border py-4 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left font-semibold text-foreground hover:text-primary transition-colors focus:outline-none"
      >
        <span className="text-base">{question}</span>
        <ChevronDown 
          size={18} 
          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
        />
      </button>
      <div 
        className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-3 opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}
      >
        <div className="overflow-hidden text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const faqs: FAQItemProps[] = [
    {
      question: "¿Cómo funciona la estimación de tiempos de arribo (ETA)?",
      answer: "El sistema de telemetría de TransiGo calcula constantemente el progreso del vehículo en la ruta actual. Tomando en cuenta la velocidad promedio del bus (aprox. 25 km/h) y la distancia geodésica restante hasta la parada virtual más cercana del usuario, calcula los segundos estimados de arribo en tiempo real."
    },
    {
      question: "¿Por qué la línea peatonal de conexión se muestra gris punteada?",
      answer: "La línea gris punteada representa la ruta de conexión a pie que el usuario debe caminar desde su posición actual (marcada con el ícono de persona verde) hasta la parada de bus virtual recomendada. El sistema conecta con OSRM Pedestrian para estimar la caminata real en base a calles peatonales."
    },
    {
      question: "¿Cómo edito o creo el trayecto de una ruta en el mapa?",
      answer: "Ve a la sección 'Operaciones', haz clic en 'Editar Trayecto' de la ruta deseada. Se abrirá el Editor de Trayectos. Activa el modo 'Ruta IDA' o 'Ruta REGRESO', haz clic sobre las calles en el mapa para trazar los puntos. El sistema utilizará OSRM automáticamente para ajustar los trazos a las pistas reales. No olvides presionar 'Guardar Todo' al finalizar."
    },
    {
      question: "¿Cómo puedo simular el movimiento de los autobuses?",
      answer: "Ingresa a la pestaña 'Monitoreo' (Simulación). El simulador cuenta con WebSockets integrados (Socket.io) que envían ráfagas automáticas de posiciones GPS desde el backend. Podrás ver la telemetría en vivo, cambiar tu ubicación satelital haciendo clic en el mapa y comprobar los tiempos de caminata y arribo reactivamente."
    },
    {
      question: "¿Qué significan los colores de las líneas del mapa?",
      answer: "Cada corredor cuenta con un color personalizado y único configurado en el panel. La línea de trazo continuo representa la ruta de IDA (Outbound), mientras que la línea con menor opacidad y patrón punteado representa la ruta de REGRESO (Return) para mantener el mapa libre de ruidos visuales."
    }
  ];

  return (
    <PageShell navbarVariant="dark">
      <div className="max-w-5xl mx-auto flex flex-col gap-10 py-6">
        
        {/* Premium Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary mx-auto md:mx-0 shadow-inner">
              <HelpCircle size={24} />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight md:text-5xl">
              Centro de Ayuda
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Encuentra manuales de operación, guías de mapas en tiempo real y respuestas a preguntas frecuentes sobre TransiGo.
            </p>
          </div>
          <div className="hidden lg:block shrink-0 opacity-85 select-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary animate-pulse"><path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5s1 4.24 2.5 5.5"/><path d="M19.5 16.5c1.5 1.26 2.5 3.19 2.5 5.5s-1 4.24-2.5 5.5"/><path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0 0 12 2Z"/><path d="M12 12c-2 0-3-1-3-3s1-3 3-3 3 1 3 3-1 3-3 3Z"/><circle cx="12" cy="17" r="1"/></svg>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-all duration-300 border-border/80 flex flex-col group hover:-translate-y-1">
            <CardHeader className="pb-3 flex flex-col gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Activity size={20} />
              </div>
              <CardTitle className="text-lg">Operaciones (Dashboard)</CardTitle>
              <CardDescription>Gestión centralizada de unidades, rutas y personalización de colores.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex-1 flex flex-col justify-between">
              <p className="leading-relaxed">
                El dashboard te permite registrar nuevos vehículos, vincularlos a corredores de ruta específicos y monitorear la salud operacional de tu flota. Puedes modificar descripciones y nombres comerciales al instante.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-border/80 flex flex-col group hover:-translate-y-1">
            <CardHeader className="pb-3 flex flex-col gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Map size={20} />
              </div>
              <CardTitle className="text-lg">Editor de Mapas</CardTitle>
              <CardDescription>Planificación de recorridos, paraderos y trazos geográficos OSRM.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex-1 flex flex-col justify-between">
              <p className="leading-relaxed">
                Mediante clics en el plano satelital puedes estructurar las calles exactas de tu transporte. El OSRM ruteador snapeará los clics de forma inteligente a las pistas de Arequipa.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-border/80 flex flex-col group hover:-translate-y-1">
            <CardHeader className="pb-3 flex flex-col gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <Zap size={20} />
              </div>
              <CardTitle className="text-lg">Simulación en Vivo</CardTitle>
              <CardDescription>Monitoreo dinámico del arribo y WebSockets en tiempo real.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex-1 flex flex-col justify-between">
              <p className="leading-relaxed">
                Muestra la conexión y telemetría activa con el servidor. Simula velocidades, posiciones e integra al usuario a la experiencia geolocalizada recomendándole la mejor intersección para abordar su bus.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* FAQs and Support Section */}
        <section className="grid gap-10 lg:grid-cols-[1fr_320px] items-start">
          
          {/* FAQ Accordion */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <BookOpen className="text-primary" size={22} />
              <h2 className="text-2xl font-bold text-foreground">Preguntas Frecuentes</h2>
            </div>
            
            <div className="bg-muted/10 rounded-2xl border border-border p-6 shadow-sm flex flex-col">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>

          {/* Quick Support Column */}
          <div className="flex flex-col gap-6">
            <Card className="bg-primary/5 border-primary/20 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="text-primary shrink-0" size={18} />
                  ¿Necesitas Soporte?
                </CardTitle>
                <CardDescription className="text-xs">
                  ¿Tienes algún inconveniente con el ruteador OSRM o WebSockets?
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Nuestro equipo de administración del sistema de transportes TransiGo está disponible para resolver dudas técnicas del backend NestJS o la base de datos PostGIS.
                </p>
                <div className="space-y-2.5">
                  <Button 
                    className="w-full text-xs font-semibold gap-2 h-9" 
                    onClick={() => window.open('mailto:soporte@transigo.com')}
                  >
                    <Mail size={14} /> Correo de Soporte
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-xs font-semibold gap-2 h-9 bg-white dark:bg-black"
                  >
                    <MessageSquare size={14} /> Chat Directo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
      </div>
    </PageShell>
  );
}
