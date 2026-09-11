'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Server,
  Activity,
  Cpu,
  Database,
  Zap,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Code2,
  BarChart3,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading, Metric, PageHeading, Text } from '@/components/ui/typography';

interface RunnerTelemetryResponse {
  runner: {
    status: 'online' | 'offline';
    latencyMs: number;
    runtimesCount: number;
    url: string;
    error?: string;
  };
  database: {
    status: 'connected' | 'degraded';
    latencyMs: number;
  };
  redis: {
    configured: boolean;
    status: 'online' | 'disabled';
  };
  stats: {
    totalExecutions: number;
    acceptedCount: number;
    wrongAnswerCount: number;
    tleCount: number;
    languageDistribution: Array<{ language: string; count: number }>;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RunnerOperationsPage() {
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'cpp' | 'java'>('python');
  const [testCode, setTestCode] = useState(
    'import sys\nprint("BigO Runner Container Diagnostic OK")\nprint(f"Python: {sys.version.split()[0]}")'
  );
  const [benchmarkResult, setBenchmarkResult] = useState<{
    latencyMs: number;
    stdout: string;
    stderr: string;
    exitCode: number;
    success: boolean;
  } | null>(null);

  const { data, isLoading, isRefetching, refetch } = useQuery<RunnerTelemetryResponse>({
    queryKey: ['admin-system-runner'],
    queryFn: async () => {
      const res = await fetch('/api/admin/system/runner');
      if (!res.ok) throw new Error('Failed to fetch runner telemetry');
      return res.json();
    },
    refetchInterval: 15000,
  });

  const testExecutionMutation = useMutation({
    mutationFn: async ({ language, code }: { language: string; code: string }) => {
      const res = await fetch('/api/admin/system/runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Execution failed');
      }
      return json;
    },
    onSuccess: (data) => {
      setBenchmarkResult(data);
      toast.success(`Benchmark finished in ${data.latencyMs}ms`);
      queryClient.invalidateQueries({ queryKey: ['admin-system-runner'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Execution error');
    },
  });

  const handleLanguageChange = (lang: 'python' | 'cpp' | 'java') => {
    setSelectedLanguage(lang);
    if (lang === 'python') {
      setTestCode('import sys\nprint("BigO Runner Container Diagnostic OK")\nprint(f"Python: {sys.version.split()[0]}")');
    } else if (lang === 'cpp') {
      setTestCode('#include <iostream>\nint main() {\n    std::cout << "BigO Runner Container Diagnostic OK (C++)" << std::endl;\n    return 0;\n}');
    } else {
      setTestCode('public class Main {\n    public static void main(String[] args) {\n        System.out.println("BigO Runner Container Diagnostic OK (Java)");\n    }\n}');
    }
  };

  const handleRunBenchmark = () => {
    testExecutionMutation.mutate({ language: selectedLanguage, code: testCode });
  };

  const runner = data?.runner;
  const db = data?.database;
  const redis = data?.redis;
  const stats = data?.stats;

  const total = stats?.totalExecutions || 0;
  const accepted = stats?.acceptedCount || 0;
  const passRate = total > 0 ? Math.round((accepted / total) * 100) : 100;

  const statusPieData = [
    { name: 'Accepted', value: stats?.acceptedCount || 0, color: '#10b981' },
    { name: 'Wrong Answer', value: stats?.wrongAnswerCount || 0, color: '#ef4444' },
    { name: 'Time Limit', value: stats?.tleCount || 0, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <PageHeading
        title="Runner & Operations Center"
        description="Real-time container execution telemetry, sandbox diagnostics, and infrastructure latency monitor."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', (isRefetching || isLoading) && 'animate-spin')} />
              Refresh Telemetry
            </Button>
            <Button size="sm" onClick={handleRunBenchmark} disabled={testExecutionMutation.isPending}>
              <Play className="mr-2 h-4 w-4 fill-current" />
              Run Sandbox Ping
            </Button>
          </div>
        }
      />


      {/* Topology / Infrastructure Connectivity Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Piston Runner Card */}
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              Docker Piston Runner
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                runner?.status === 'online'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-500'
              )}
            >
              {runner?.status === 'online' ? (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              ) : (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              {runner?.status?.toUpperCase() || 'CHECKING'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{runner?.latencyMs ?? 0} ms</div>
              <span className="text-xs text-muted-foreground">
                {runner?.runtimesCount ?? 0} runtimes loaded
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground truncate" title={runner?.url}>
              Endpoint: {runner?.url || 'http://localhost:2000'}
            </p>
          </CardContent>
        </Card>

        {/* MongoDB Atlas Card */}
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              MongoDB Atlas
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                db?.status === 'connected'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-500'
              )}
            >
              {db?.status === 'connected' ? (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              ) : (
                <Activity className="mr-1 h-3 w-3" />
              )}
              {db?.status?.toUpperCase() || 'CHECKING'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{db?.latencyMs ?? 0} ms</div>
              <span className="text-xs text-muted-foreground">Round-trip ping</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Cluster Primary Replica</p>
          </CardContent>
        </Card>

        {/* Upstash Redis Card */}
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Upstash Redis
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                redis?.status === 'online'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                  : 'border-muted bg-muted/20 text-muted-foreground'
              )}
            >
              {redis?.status === 'online' ? 'ACTIVE' : 'STANDBY'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {redis?.configured ? 'Connected' : 'In-Memory'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {redis?.configured ? 'Distributed Rate Limiting' : 'Local Fallback'}
            </p>
          </CardContent>
        </Card>

        {/* Execution Throughput Card */}
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Execution Pass Rate
            </CardTitle>
            <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-500">
              {passRate}% PASSED
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total.toLocaleString()} runs</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {accepted.toLocaleString()} successful candidate submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Language Distribution */}
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Execution Volume by Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              {stats?.languageDistribution && stats.languageDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.languageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="language" stroke="#888888" fontSize={12} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No submissions recorded yet for language breakdown
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verdict Distribution */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Submission Verdicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full flex flex-col items-center justify-center">
              {statusPieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                    {statusPieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}:</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No executions to summarize</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sandbox Test Execution Workbench */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              Live Runner Sandbox Diagnostic
            </CardTitle>
            <Text tone="muted" className="text-xs mt-0.5">
              Execute test payloads directly in the isolated Docker container to measure real-time latency and container output.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            {(['python', 'cpp', 'java'] as const).map((lang) => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs capitalize"
                onClick={() => handleLanguageChange(lang)}
              >
                {lang}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Code Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Code2 className="h-3.5 w-3.5" /> Benchmark Source Code
                </span>
                <span className="font-mono">{selectedLanguage}</span>
              </div>
              <textarea
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                className="w-full h-44 rounded-md border border-border/70 bg-black/40 p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                spellCheck={false}
              />
              <Button
                onClick={handleRunBenchmark}
                disabled={testExecutionMutation.isPending}
                className="w-full sm:w-auto"
                size="sm"
              >
                <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                {testExecutionMutation.isPending ? 'Executing in Container...' : 'Execute Diagnostic'}
              </Button>
            </div>

            {/* Execution Result Terminal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5" /> Container Console Output
                </span>
                {benchmarkResult && (
                  <span className="font-mono text-emerald-400">
                    {benchmarkResult.latencyMs} ms | Exit: {benchmarkResult.exitCode}
                  </span>
                )}
              </div>
              <div className="w-full h-44 rounded-md border border-border/70 bg-black/80 p-3 font-mono text-xs overflow-auto">
                {benchmarkResult ? (
                  <div className="space-y-2">
                    {benchmarkResult.stdout && (
                      <div>
                        <div className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                          STDOUT
                        </div>
                        <pre className="text-emerald-300 whitespace-pre-wrap">{benchmarkResult.stdout}</pre>
                      </div>
                    )}
                    {benchmarkResult.stderr && (
                      <div>
                        <div className="text-rose-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                          STDERR
                        </div>
                        <pre className="text-rose-300 whitespace-pre-wrap">{benchmarkResult.stderr}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                    Click &ldquo;Execute Diagnostic&rdquo; to test container response
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
