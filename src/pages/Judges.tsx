import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Gavel,
  Bot,
  AlertCircle,
  CheckCircle,
  Power
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { Judge } from '@/types';

const modelOptions = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.1-8b-instant'
];

export function Judges() {
  const { toast } = useToast();
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
    modelName: 'openai/gpt-oss-120b',
    isActive: true
  });

  useEffect(() => {
    loadJudges();
  }, []);

  const loadJudges = async () => {
    setLoading(true);
    const data = await dataService.getJudges();
    setJudges(data);
    setLoading(false);
  };

  const handleOpenDialog = (judge?: Judge) => {
    if (judge) {
      setEditingJudge(judge);
      setFormData({
        name: judge.name,
        systemPrompt: judge.systemPrompt,
        modelName: judge.modelName,
        isActive: judge.isActive
      });
    } else {
      setEditingJudge(null);
      setFormData({
        name: '',
        systemPrompt: '',
        modelName: 'openai/gpt-oss-120b',
        isActive: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingJudge(null);
    setFormData({
      name: '',
      systemPrompt: '',
      modelName: 'openai/gpt-oss-120b',
      isActive: true
    });
  };

  const handleSave = async () => {
    if (editingJudge) {
      await dataService.updateJudge(editingJudge.id, formData);
    } else {
      await dataService.createJudge(formData);
    }
    await loadJudges();
    handleCloseDialog();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this judge?')) {
      try {
        await dataService.deleteJudge(id);
        await loadJudges();
        toast({
          title: "Judge Deleted",
          description: "The judge has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting judge:', error);
        toast({
          title: "Error",
          description: "Failed to delete judge. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleActive = async (judge: Judge) => {
    await dataService.updateJudge(judge.id, { isActive: !judge.isActive });
    await loadJudges();
  };

  const activeJudges = judges.filter(j => j.isActive);
  const inactiveJudges = judges.filter(j => !j.isActive);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Judges</h2>
          <p className="text-muted-foreground mt-2">
            Create and manage AI judges for evaluating submissions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              New Judge
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingJudge ? 'Edit Judge' : 'Create New Judge'}
              </DialogTitle>
              <DialogDescription>
                Configure the judge's name, system prompt, and model settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Accuracy Judge"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={formData.modelName}
                  onValueChange={(value) => setFormData({ ...formData, modelName: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">System Prompt / Rubric</Label>
                <Textarea
                  id="prompt"
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  placeholder="Enter the evaluation criteria and instructions for this judge..."
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingJudge ? 'Save Changes' : 'Create Judge'}
              </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Judges</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{judges.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJudges.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveJudges.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Judges List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading judges...</p>
          </CardContent>
        </Card>
      ) : judges.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No judges yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first AI judge to start evaluating submissions
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Judge
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {judges.map((judge) => (
            <Card key={judge.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${judge.isActive ? 'bg-green-600' : 'bg-gray-400'}`} />
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{judge.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {judge.modelName}
                      </Badge>
                      <Badge variant={judge.isActive ? 'default' : 'secondary'}>
                        {judge.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(judge)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(judge)}>
                        <Power className="mr-2 h-4 w-4" />
                        {judge.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(judge.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {judge.systemPrompt}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(judge.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}