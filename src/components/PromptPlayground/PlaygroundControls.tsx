import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  PlayCircle, 
  Loader2, 
  Settings, 
  Save,
  Download,
  Upload,
  RotateCcw,
  History
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface PlaygroundControlsProps {
  model: string;
  temperature: number;
  maxTokens: number;
  onModelChange: (model: string) => void;
  onTemperatureChange: (temp: number) => void;
  onMaxTokensChange: (tokens: number) => void;
  onRun: () => void;
  onSaveVersion?: () => void;
  onExportToJudge?: () => void;
  onShowHistory?: () => void;
  onReset?: () => void;
  isRunning?: boolean;
  canRun?: boolean;
  runLabel?: string;
}

const MODEL_OPTIONS = [
  { value: 'openai/gpt-oss-120b', label: 'GPT OSS 120B' },
  { value: 'openai/gpt-oss-20b', label: 'GPT OSS 20B' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
];

export function PlaygroundControls({
  model,
  temperature,
  maxTokens,
  onModelChange,
  onTemperatureChange,
  onMaxTokensChange,
  onRun,
  onSaveVersion,
  onExportToJudge,
  onShowHistory,
  onReset,
  isRunning = false,
  canRun = true,
  runLabel = 'Run Evaluation'
}: PlaygroundControlsProps) {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        {/* Model Selection */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="model" className="text-sm">Model:</Label>
          <Select value={model} onValueChange={onModelChange}>
            <SelectTrigger id="model" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Settings */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">Temperature</Label>
                  <span className="text-sm text-muted-foreground">{temperature.toFixed(1)}</span>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={([value]) => onTemperatureChange(value)}
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness. Lower is more deterministic.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <span className="text-sm text-muted-foreground">{maxTokens}</span>
                </div>
                <Slider
                  id="maxTokens"
                  min={50}
                  max={2000}
                  step={50}
                  value={[maxTokens]}
                  onValueChange={([value]) => onMaxTokensChange(value)}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum tokens in the response.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Quick Actions */}
        {onReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Version History */}
        {onShowHistory && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowHistory}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        )}

        {/* Save Version */}
        {onSaveVersion && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveVersion}
            disabled={isRunning}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Version
          </Button>
        )}

        {/* Export to Judge */}
        {onExportToJudge && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportToJudge}
            disabled={isRunning}
          >
            <Upload className="h-4 w-4 mr-2" />
            Export to Judge
          </Button>
        )}

        <Separator orientation="vertical" className="h-8" />

        {/* Run Button */}
        <Button 
          onClick={onRun}
          disabled={isRunning || !canRun}
          size="default"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              {runLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function PlaygroundControlsCompact({
  model,
  onModelChange,
  onRun,
  isRunning = false,
  canRun = true
}: Pick<PlaygroundControlsProps, 'model' | 'onModelChange' | 'onRun' | 'isRunning' | 'canRun'>) {
  return (
    <div className="flex items-center space-x-2">
      <Select value={model} onValueChange={onModelChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODEL_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        onClick={onRun}
        disabled={isRunning || !canRun}
        size="sm"
      >
        {isRunning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PlayCircle className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}