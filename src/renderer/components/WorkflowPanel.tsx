import React from 'react'
import { CheckCircle, Clock, AlertCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from './ui'

interface WorkflowStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string
  error?: string
}

interface WorkflowPanelProps {
  steps: WorkflowStep[]
  title?: string
}

export default function WorkflowPanel({ steps, title = 'Agent 工作流' }: WorkflowPanelProps) {
  const [expanded, setExpanded] = React.useState(true)

  const statusIcon = {
    pending: <Clock className="w-4 h-4 text-gray-500" />,
    running: <Loader2 className="w-4 h-4 text-accent animate-spin" />,
    completed: <CheckCircle className="w-4 h-4 text-success" />,
    failed: <AlertCircle className="w-4 h-4 text-danger" />
  }

  const completedCount = steps.filter(s => s.status === 'completed').length
  const failedCount = steps.filter(s => s.status === 'failed').length
  const runningCount = steps.filter(s => s.status === 'running').length

  return (
    <div className="bg-secondary rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary-light transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-medium">{title}</span>
          <Badge variant="default" size="sm">
            {steps.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {runningCount > 0 && (
            <Badge variant="warning" size="sm">
              {runningCount} 进行中
            </Badge>
          )}
          {failedCount > 0 && (
            <Badge variant="danger" size="sm">
              {failedCount} 失败
            </Badge>
          )}
        </div>
      </div>

      {/* Steps */}
      {expanded && (
        <div className="border-t border-secondary-light divide-y divide-secondary-light">
          {steps.map((step, index) => (
            <div key={step.id} className="px-4 py-3 hover:bg-secondary-light transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{statusIcon[step.status]}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{step.name}</span>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>

                  {step.result && (
                    <div className="mt-1 text-sm text-gray-400 truncate">
                      {step.result}
                    </div>
                  )}

                  {step.error && (
                    <div className="mt-1 text-sm text-danger">
                      {step.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 示例工作流数据
export const exampleWorkflowSteps: WorkflowStep[] = [
  { id: '1', name: '分析用户请求', status: 'completed', result: '识别为代码生成任务' },
  { id: '2', name: '搜索相关代码', status: 'completed', result: '找到 3 个相关文件' },
  { id: '3', name: '生成代码', status: 'running' },
  { id: '4', name: '代码审查', status: 'pending' },
  { id: '5', name: '执行测试', status: 'pending' }
]
