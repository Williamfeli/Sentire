import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Brain, ClipboardCheck, ArrowRight, ArrowLeft, CheckCircle, CircleAlert, XCircle, Shield, ShieldAlert, Printer, RotateCcw, Info, Lightbulb, AlertTriangle, Clock, Calendar, TrendingUp } from "lucide-react";
import { HeartLogo } from "@/components/ui/heart-logo";
import { useToast } from "@/hooks/use-toast";

interface AssessmentResult {
  score: number;
  nivel: string;
  sugestao: string;
}

const questions = [
  "Nos últimos 15 dias, com que frequência você se sentiu nervoso ou ansioso?",
  "Com que frequência você teve dificuldade para relaxar?",
  "Com que frequência você se sentiu inquieto ou impaciente?",
  "Com que frequência você teve dificuldade para se concentrar?",
  "Com que frequência você se sentiu irritado ou com raiva facilmente?",
  "Com que frequência você teve dificuldades para dormir?",
  "Com que frequência você se sentiu cansado ou com pouca energia?",
  "Com que frequência você perdeu interesse nas atividades do dia a dia?",
  "Com que frequência você se sentiu triste ou deprimido?"
];

const responseOptions = [
  { value: 1, label: "Nunca", description: "Não senti isso nos últimos 15 dias" },
  { value: 2, label: "Raramente", description: "Poucos dias nos últimos 15 dias" },
  { value: 3, label: "Frequentemente", description: "Mais da metade dos dias" },
  { value: 4, label: "Sempre", description: "Quase todos os dias" }
];

type AssessmentStage = 'intro' | 'candidate-info' | 'questionnaire' | 'loading' | 'results';

export default function Assessment() {
  const { toast } = useToast();
  const [stage, setStage] = useState<AssessmentStage>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>(new Array(questions.length).fill(0));
  const [currentResponse, setCurrentResponse] = useState<number>(0);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");

  const assessmentMutation = useMutation({
    mutationFn: async (data: { respostas: number[], candidateName?: string, candidateEmail?: string }) => {
      const response = await apiRequest('POST', '/api/avaliar', data);
      return response.json();
    },
    onSuccess: (data: AssessmentResult) => {
      setResults(data);
      setStage('results');
    },
    onError: (error) => {
      toast({
        title: "Erro na avaliação",
        description: "Não foi possível processar sua avaliação. Tente novamente.",
        variant: "destructive"
      });
      setStage('questionnaire');
    }
  });

  const startAssessment = () => {
    setStage('candidate-info');
  };

  const startQuestionnaire = () => {
    setStage('questionnaire');
    setCurrentQuestion(0);
    setResponses(new Array(questions.length).fill(0));
    setCurrentResponse(0);
  };

  const nextQuestion = () => {
    if (currentResponse === 0) return;
 
    const newResponses = [...responses];
    newResponses[currentQuestion] = currentResponse;
    setResponses(newResponses);

    if (currentQuestion === questions.length - 1) {
      // Submit assessment
      setStage('loading');
      assessmentMutation.mutate({
        respostas: newResponses,
        candidateName: candidateName || undefined,
        candidateEmail: candidateEmail || undefined
      });
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentResponse(responses[currentQuestion + 1] || 0);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentResponse(responses[currentQuestion - 1] || 0);
    }
  };

  const printResults = () => {
    window.print();
  };

  const startNewAssessment = () => {
    setStage('intro');
    setCurrentQuestion(0);
    setResponses(new Array(questions.length).fill(0));
    setCurrentResponse(0);
    setResults(null);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const getRiskLevelColor = (nivel: string) => {
    switch (nivel) {
      case 'Baixo': return 'success';
      case 'Moderado': return 'warning';
      case 'Alto': return 'danger';
      default: return 'success';
    }
  };

  const getRiskIcon = (nivel: string) => {
    switch (nivel) {
      case 'Baixo': return <Shield className="w-8 h-8" />;
      case 'Moderado': return <ShieldAlert className="w-8 h-8" />;
      case 'Alto': return <Shield className="w-8 h-8" />;
      default: return <Shield className="w-8 h-8" />;
    }
  };

  const getResultIcon = (nivel: string) => {
    switch (nivel) {
      case 'Baixo': return <Shield className="w-20 h-20 text-green-600" />;
      case 'Moderado': return <AlertTriangle className="w-20 h-20 text-orange-600" />;
      case 'Alto': return <TrendingUp className="w-20 h-20 text-red-600" />;
      default: return <Shield className="w-20 h-20 text-green-600" />;
    }
  };

  const getTimeBasedRisk = (nivel: string, timeframe: 'short' | 'medium' | 'long') => {
    const risks = {
      'Baixo': {
        short: { percentage: '5-10%', description: 'Risco mínimo de desenvolvimento de sintomas relacionados ao estresse ocupacional' },
        medium: { percentage: '10-15%', description: 'Baixa probabilidade de impacto na produtividade por questões emocionais' },
        long: { percentage: '15-20%', description: 'Manutenção da estabilidade emocional com práticas adequadas de bem-estar' }
      },
      'Moderado': {
        short: { percentage: '25-35%', description: 'Risco moderado de sintomas de estresse e ansiedade relacionados ao trabalho' },
        medium: { percentage: '35-50%', description: 'Possível impacto na performance e relacionamentos profissionais' },
        long: { percentage: '50-65%', description: 'Alto risco de burnout ou transtornos relacionados ao trabalho sem intervenção' }
      },
      'Alto': {
        short: { percentage: '60-75%', description: 'Alto risco imediato de sintomas severos de estresse ocupacional' },
        medium: { percentage: '75-85%', description: 'Provável desenvolvimento de problemas de saúde mental relacionados ao trabalho' },
        long: { percentage: '85-95%', description: 'Risco muito alto de doenças ocupacionais graves sem intervenção imediata' }
      }
    };
    return risks[nivel as keyof typeof risks]?.[timeframe] || risks['Baixo'][timeframe];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-50 to-white shadow-sm border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <HeartLogo className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">
                  Sentire
                </h1>
                <p className="text-sm text-purple-700 font-medium">Triagem Emocional Inteligente</p>
                <p className="text-xs text-purple-600">Cuidando da saúde mental desde o primeiro contato com o talento</p>
              </div>
            </div>
            <div>
              <Button
                onClick={() => window.location.href = '/login'}
                variant="outline"
                size="sm"
                className="text-purple-700 border-purple-300 hover:bg-purple-50"
                data-testid="button-recruiter-login"
              >
                Acesso Recrutador
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
 
          {/* Intro Stage */}
          {stage === 'intro' && (
            <Card className="shadow-sm border border-slate-200">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <HeartLogo className="w-20 h-20" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent mb-3">
                      Avaliação de Risco Ocupacional
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      Um questionário científico que identifica o risco de desenvolver doenças ocupacionais relacionadas ao estresse e bem-estar no trabalho.
                      Responda com honestidade para obter uma avaliação de risco personalizada.
                    </p>
                  </div>
 
                  <div className="bg-slate-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                      <Info className="text-primary mr-2 w-5 h-5" />
                      Instruções
                    </h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Leia cada pergunta cuidadosamente
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Responda de acordo com como você se sente nos últimos 15 dias
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Use a escala de 1 (nunca) a 4 (sempre)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Todas as informações são confidenciais
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={startAssessment}
                    className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white font-semibold py-4 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    data-testid="button-start-assessment"
                  >
                    Iniciar Avaliação
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Candidate Information Stage */}
          {stage === 'candidate-info' && (
            <Card className="shadow-sm border border-slate-200">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <ClipboardCheck className="w-16 h-16 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent mb-3">
                      Informações do Candidato
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      Para personalizar sua avaliação, preencha as informações abaixo. Estes dados são opcionais mas nos ajudam a melhorar a análise.
                    </p>
                  </div>
 
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="text-left">
                      <Label htmlFor="candidateName" className="text-sm font-medium text-slate-700">
                        Nome completo (opcional)
                      </Label>
                      <Input
                        id="candidateName"
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="Digite seu nome completo"
                        className="mt-1"
                        data-testid="input-candidate-name"
                      />
                    </div>
 
                    <div className="text-left">
                      <Label htmlFor="candidateEmail" className="text-sm font-medium text-slate-700">
                        Email (opcional)
                      </Label>
                      <Input
                        id="candidateEmail"
                        type="email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="Digite seu email"
                        className="mt-1"
                        data-testid="input-candidate-email"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 justify-center">
                    <Button
                      onClick={() => setStage('intro')}
                      variant="outline"
                      className="flex items-center space-x-2"
                      data-testid="button-back-to-intro"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </Button>
 
                    <Button
                      onClick={startQuestionnaire}
                      className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white font-semibold flex items-center space-x-2"
                      data-testid="button-start-questionnaire"
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questionnaire Stage */}
          {stage === 'questionnaire' && (
            <Card className="shadow-sm border border-slate-200">
              <CardContent className="p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600">Progresso da Avaliação</span>
                    <span className="text-sm font-medium text-primary" data-testid="text-progress">
                      {currentQuestion + 1} de {questions.length}
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" data-testid="progress-assessment" />
                </div>

                {/* Question Display */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6" data-testid="text-question">
                    {questions[currentQuestion]}
                  </h3>
 
                  {/* Response Scale */}
                  <RadioGroup
                    value={currentResponse.toString()}
                    onValueChange={(value) => setCurrentResponse(parseInt(value))}
                    className="space-y-3"
                    data-testid="radiogroup-responses"
                  >
                    {responseOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                        <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} className="w-5 h-5 text-primary border-slate-300" data-testid={`radio-option-${option.value}`} />
                        <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
                          <div className="font-medium text-slate-900 group-hover:text-primary transition-colors">
                            {option.label}
                          </div>
                          <div className="text-sm text-slate-600">
                            {option.description}
                          </div>
                        </Label>
                        <div className="text-2xl font-bold text-slate-400 group-hover:text-primary transition-colors">
                          {option.value}
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    onClick={previousQuestion}
                    variant="outline"
                    disabled={currentQuestion === 0}
                    className="flex items-center space-x-2"
                    data-testid="button-previous"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </Button>

                  <Button
                    onClick={nextQuestion}
                    disabled={currentResponse === 0}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
                    data-testid="button-next"
                  >
                    <span>{currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading Stage */}
          {stage === 'loading' && (
            <Card className="shadow-sm border border-slate-200">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Brain className="text-primary w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Processando Respostas</h3>
                    <p className="text-slate-600">Analisando suas respostas e gerando o relatório...</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Stage */}
          {stage === 'results' && results && (
            <Card className="shadow-sm border border-slate-200">
              <CardContent className="p-8">
                <div className="text-center space-y-8">
                  <div>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center">
                      {getResultIcon(results.nivel)}
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Avaliação de Risco Ocupacional</h2>
                    <p className="text-lg text-slate-600">Análise completa do potencial de desenvolvimento de doenças ocupacionais</p>
                  </div>

                  {/* Score Display */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2" data-testid="text-score">
                        <span className="text-slate-900">{results.score}</span>
                        <span className="text-slate-600 text-2xl">/36</span>
                      </div>
                      <p className="text-slate-600">Pontuação Total</p>
                    </div>
                  </div>

                  {/* Simplified Results for Candidates */}
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-600 mb-3">
                        Avaliação Concluída
                      </h3>
                      <p className="text-slate-700 text-lg" data-testid="text-recommendation">
                        {results.sugestao}
                      </p>
                    </div>

                    {/* Thank You Message */}
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Obrigado por participar!
                      </h4>
                      <p className="text-slate-700">
                        Seus dados foram registrados e serão analisados pela equipe de recursos humanos.
                        Você receberá um retorno em breve sobre o processo seletivo.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={printResults}
                      variant="outline"
                      className="flex items-center justify-center space-x-2"
                      data-testid="button-print"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Resultados</span>
                    </Button>

                    <Button
                      onClick={startNewAssessment}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700"
                      data-testid="button-new-assessment"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Nova Avaliação</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-50 to-white border-t border-purple-100 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <HeartLogo className="w-6 h-6" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">
                Sentire
              </span>
            </div>
            <div className="text-sm text-purple-700">
              <p>&copy; 2025 Sentire - Triagem Emocional Inteligente. Todos os direitos reservados.</p>
              <p className="mt-1 text-purple-600">Esta ferramenta é destinada apenas para fins de triagem e não substitui avaliação profissional.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
