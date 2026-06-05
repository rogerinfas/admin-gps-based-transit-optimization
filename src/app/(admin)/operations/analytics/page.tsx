import Link from "next/link";
import PageShell from "@/components/layout/page-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, ShieldCheck, CheckCircle2, Download, Table, TrendingDown } from "lucide-react";

// Datos del experimento generados por el script (20 muestras)
const experimentData = [
  { id: 1, pre: 14.9, post: 13.2 },
  { id: 2, pre: 14.7, post: 6.1 },
  { id: 3, pre: 13.4, post: 7.5 },
  { id: 4, pre: 9.5, post: 6.6 },
  { id: 5, pre: 12.9, post: 7.8 },
  { id: 6, pre: 10.1, post: 7.0 },
  { id: 7, pre: 16.6, post: 8.2 },
  { id: 8, pre: 13.4, post: 7.1 },
  { id: 9, pre: 16.9, post: 8.5 },
  { id: 10, pre: 17.1, post: 10.1 },
  { id: 11, pre: 11.8, post: 7.5 },
  { id: 12, pre: 17.6, post: 7.4 },
  { id: 13, pre: 15.7, post: 8.4 },
  { id: 14, pre: 12.0, post: 8.1 },
  { id: 15, pre: 24.5, post: 7.4 },
  { id: 16, pre: 21.3, post: 6.9 },
  { id: 17, pre: 16.9, post: 5.7 },
  { id: 18, pre: 11.6, post: 9.1 },
  { id: 19, pre: 13.5, post: 9.0 },
  { id: 20, pre: 21.0, post: 9.4 }
];


export default function AnalyticsPage() {
  return (
    <PageShell navbarVariant="dark">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                render={<Link href="/operations" />}
                nativeButton={false}
                className="h-8 w-8 text-muted-foreground"
              >
                <ArrowLeft size={16} />
              </Button>
              <Badge variant="outline" className="border-primary/30 text-primary">Validación Académica</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Prueba de Rangos con Signo de Wilcoxon</h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Análisis estadístico no paramétrico para validar la reducción significativa en los tiempos de espera de los usuarios tras la implementación del sistema web con telemetría GPS.
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button variant="outline" className="gap-2">
              <Download size={16} /> Exportar CSV
            </Button>
          </div>
        </div>

        {/* Resumen de Resultados del Test */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary font-bold">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  Hipótesis Validada Exitosamente
                </CardTitle>
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Rechazo de H0</Badge>
              </div>
              <CardDescription>
                Contraste de Hipótesis para Muestras Relacionadas (N = 20, Confianza 95%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="leading-relaxed">
                Los resultados de la prueba de <strong>Wilcoxon</strong> indican que el estadístico de prueba es <strong>W = 210.0</strong>, con un valor de probabilidad asociado <strong>p = 9.54e-07</strong>. Al ser este valor menor que el nivel de significancia prefijado <strong>α = 0.05</strong> (y menor al valor crítico unilateral tabulado W_crit = 60), se rechaza la hipótesis nula ($H_0$).

              </p>
              <div className="p-3 bg-background/50 rounded-lg border border-border flex items-start gap-3">
                <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-semibold text-foreground">Conclusión Estadística</h4>
                  <p className="text-muted-foreground text-xs mt-1">
                    Existe evidencia estadística altamente significativa para afirmar que la mediana de los tiempos de espera de los usuarios se redujo de manera efectiva tras la implementación del panel de monitoreo y predicción de ETA basado en GPS.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Parámetros del Test</CardTitle>
              <CardDescription>Valores clave calculados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs border-b pb-1">
                  <span className="text-muted-foreground">Estadístico W</span>
                  <span className="font-mono font-semibold text-foreground">210.0</span>
                </div>
                <div className="flex justify-between text-xs border-b pb-1">
                  <span className="text-muted-foreground">p-valor obtenido</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">9.54e-07</span>
                </div>
                <div className="flex justify-between text-xs border-b pb-1">
                  <span className="text-muted-foreground">Suma Rangos Positivos ($W^+$)</span>
                  <span className="font-mono font-semibold text-foreground">210.0</span>
                </div>
                <div className="flex justify-between text-xs border-b pb-1">
                  <span className="text-muted-foreground">Suma Rangos Negativos ($W^-$)</span>
                  <span className="font-mono font-semibold text-foreground">0.0</span>
                </div>
                <div className="flex justify-between text-xs pb-1">
                  <span className="text-muted-foreground">Nivel de Significancia (α)</span>
                  <span className="font-mono font-semibold text-foreground">0.05</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs bg-muted p-2 rounded">
                <TrendingDown size={14} className="text-primary" />
                <span>Reducción promedio: <strong>-47.28%</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticos Descriptivos y Boxplot */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tabla de Estadísticos Descriptivos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table size={18} className="text-primary" />
                Estadísticos Descriptivos
              </CardTitle>
              <CardDescription>
                Comparación directa entre la situación actual (Pre-test) y la propuesta tecnológica (Post-test)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 font-semibold text-muted-foreground">Métrica</th>
                      <th className="p-3 font-semibold text-muted-foreground text-right">Pre-test (Sin GPS)</th>
                      <th className="p-3 font-semibold text-muted-foreground text-right">Post-test (Con GPS)</th>
                      <th className="p-3 font-semibold text-muted-foreground text-right">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">Media Aritmética</td>
                      <td className="p-3 text-right">15.27 min</td>
                      <td className="p-3 text-right">8.05 min</td>
                      <td className="p-3 text-right text-emerald-500 font-semibold">-7.22 min (-47.3%)</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">Mediana</td>
                      <td className="p-3 text-right">14.80 min</td>
                      <td className="p-3 text-right">7.65 min</td>
                      <td className="p-3 text-right text-emerald-500 font-semibold">-7.15 min (-48.3%)</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">Desviación Estándar</td>
                      <td className="p-3 text-right">3.86 min</td>
                      <td className="p-3 text-right">1.64 min</td>
                      <td className="p-3 text-right text-emerald-500">-2.22 min</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">Mínimo</td>
                      <td className="p-3 text-right">9.50 min</td>
                      <td className="p-3 text-right">5.70 min</td>
                      <td className="p-3 text-right">-3.80 min</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">Máximo</td>
                      <td className="p-3 text-right">24.50 min</td>
                      <td className="p-3 text-right">13.20 min</td>
                      <td className="p-3 text-right text-emerald-500 font-semibold">-11.30 min</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-medium">Prueba Normalidad (p)</td>
                      <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">0.3608 (Normal)</td>
                      <td className="p-3 text-right font-semibold text-destructive">0.0205 (No Normal)</td>
                      <td className="p-3 text-right text-muted-foreground">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground">
                <strong>Nota metodológica:</strong> Al dar un valor p &lt; 0.05 en la prueba de Shapiro-Wilk para el conjunto de datos de Post-test, se rechaza la hipótesis de distribución normal para ese grupo. Como al menos uno de los grupos no sigue una distribución normal, se justifica la aplicación obligatoria de la prueba no paramétrica de Wilcoxon en lugar de una t-Student pareada.
              </div>
            </CardContent>
          </Card>

          {/* Gráfico Comparativo SVG (Boxplot) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Distribución de Tiempos de Espera
              </CardTitle>
              <CardDescription>
                Visualización de cuartiles, medianas y dispersión (Diagrama de cajas / Boxplot)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
              <svg viewBox="0 0 400 280" className="w-full max-w-sm h-auto">
                {/* Cuadrícula de fondo */}
                <line x1="50" y1="40" x2="350" y2="40" stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <text x="35" y="45" fontSize="10" className="fill-muted-foreground text-right" textAnchor="end">30 min</text>

                <line x1="50" y1="90" x2="350" y2="90" stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <text x="35" y="95" fontSize="10" className="fill-muted-foreground" textAnchor="end">22 min</text>

                <line x1="50" y1="140" x2="350" y2="140" stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <text x="35" y="145" fontSize="10" className="fill-muted-foreground" textAnchor="end">15 min</text>

                <line x1="50" y1="190" x2="350" y2="190" stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <text x="35" y="195" fontSize="10" className="fill-muted-foreground" textAnchor="end">8 min</text>

                <line x1="50" y1="240" x2="350" y2="240" stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <text x="35" y="245" fontSize="10" className="fill-muted-foreground" textAnchor="end">0 min</text>

                {/* --- CAJA 1: PRE-TEST (Sin GPS) --- */}
                {/* Max: 24.50 (y = 77), Q3: 16.95 (y = 127), Mediana: 14.80 (y = 141), Q1: 12.68 (y = 155), Min: 9.50 (y = 177) */}
                {/* Bigote superior */}
                <line x1="130" y1="127" x2="130" y2="77" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
                <line x1="115" y1="77" x2="145" y2="77" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />

                {/* Caja */}
                <rect x="100" y="127" width="60" height="28" fill="#f87171" fillOpacity="0.75" stroke="#ef4444" strokeWidth="1.5" />
                {/* Mediana */}
                <line x1="100" y1="141" x2="160" y2="141" stroke="#1e293b" strokeWidth="2.5" />

                {/* Bigote inferior */}
                <line x1="130" y1="155" x2="130" y2="177" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
                <line x1="115" y1="177" x2="145" y2="177" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />

                {/* --- CAJA 2: POST-TEST (Con GPS) --- */}
                {/* Max: 13.20 (y = 152), Q3: 8.62 (y = 183), Mediana: 7.65 (y = 189), Q1: 7.07 (y = 193), Min: 5.70 (y = 202) */}
                {/* Bigote superior */}
                <line x1="270" y1="183" x2="270" y2="152" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
                <line x1="255" y1="152" x2="285" y2="152" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />

                {/* Caja */}
                <rect x="240" y="183" width="60" height="10" fill="#60a5fa" fillOpacity="0.75" stroke="#3b82f6" strokeWidth="1.5" />
                {/* Mediana */}
                <line x1="240" y1="189" x2="300" y2="189" stroke="#1e293b" strokeWidth="2.5" />

                {/* Bigote inferior */}
                <line x1="270" y1="193" x2="270" y2="202" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
                <line x1="255" y1="202" x2="285" y2="202" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />

                {/* Eje X Etiquetas */}
                <text x="130" y="262" fontSize="11" fontWeight="bold" className="fill-foreground text-center" textAnchor="middle">Pre-test (Sin GPS)</text>
                <text x="270" y="262" fontSize="11" fontWeight="bold" className="fill-foreground text-center" textAnchor="middle">Post-test (Con GPS)</text>
              </svg>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-400 rounded-sm"></span>Pre-test</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-400 rounded-sm"></span>Post-test</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-slate-800 inline-block"></span>Mediana</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalle de Muestras */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Muestras del Experimento (N = 20)</CardTitle>
            <CardDescription>
              Comparación detallada por usuario del tiempo de espera registrado en minutos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto border rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-background border-b z-10 shadow-sm">
                  <tr>
                    <th className="p-3 font-semibold text-muted-foreground">ID Usuario</th>
                    <th className="p-3 font-semibold text-muted-foreground">T. Espera Pre-test (min)</th>
                    <th className="p-3 font-semibold text-muted-foreground">T. Espera Post-test (min)</th>
                    <th className="p-3 font-semibold text-muted-foreground">Diferencia (min)</th>
                    <th className="p-3 font-semibold text-muted-foreground">¿Reducción?</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {experimentData.map((row) => {
                    const diff = parseFloat((row.post - row.pre).toFixed(1));
                    const isReduction = diff < 0;
                    return (
                      <tr key={row.id} className="hover:bg-muted/30">
                        <td className="p-3 font-mono">#{String(row.id).padStart(2, '0')}</td>
                        <td className="p-3 font-mono">{row.pre.toFixed(1)}</td>
                        <td className="p-3 font-mono">{row.post.toFixed(1)}</td>
                        <td className={`p-3 font-mono font-semibold ${isReduction ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                        <td className="p-3">
                          <Badge variant={isReduction ? "default" : "destructive"} className={isReduction ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                            {isReduction ? "Sí (-)" : "No (+)"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
