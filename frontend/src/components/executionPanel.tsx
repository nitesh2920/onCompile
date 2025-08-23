import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface ExecutionPanelProps {
  output: string;
  isRunning: boolean;
  stdin: string;
  setStdin: React.Dispatch<React.SetStateAction<string>>;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  output,
  isRunning,
  stdin,
  setStdin
}) => {
  return (
    <>
      <div className="space-y-4">
        <Card className="border-primary/20 ">
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-950 text-green-400 p-4 rounded-lg min-h-[300px] max-h-[400px] overflow-auto lg:overflow-hidden">
              {output ||
                (isRunning
                  ? "Running your code..."
                  : "Click 'Run Code' to see output here...")}
            </pre>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={4}
              className="font-mono"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ExecutionPanel;
