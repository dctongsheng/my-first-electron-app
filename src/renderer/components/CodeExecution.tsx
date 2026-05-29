import React, { useState } from 'react'
import { Play, Copy, Trash2 } from 'lucide-react'
import Button from './ui/Button'
import { CodeBlock } from './ui'
import { Badge } from './ui'

interface CodeExecutionProps {
  code: string
  language?: string
  filename?: string
}

export default function CodeExecution({ code, language = 'typescript', filename }: CodeExecutionProps) {
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')

    // 模拟代码执行
    setTimeout(() => {
      setOutput('// 执行结果\n// (实际代码执行功能需要在主进程中实现)\nconsole.log("Hello, World!");\n\n// 输出: Hello, World!')
      setIsRunning(false)
      setHasRun(true)
    }, 1000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  const handleClear = () => {
    setOutput('')
    setHasRun(false)
  }

  return (
    <div className="space-y-2">
      {/* 代码块 */}
      <CodeBlock code={code} language={language} filename={filename} />

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleRun} disabled={isRunning}>
          {isRunning ? (
            <>
              <svg className="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              运行中...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" />
              运行代码
            </>
          )}
        </Button>

        <Button variant="ghost" size="sm" onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-1" />
          复制
        </Button>

        {hasRun && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-1" />
            清除输出
          </Button>
        )}

        <Badge variant={hasRun ? 'success' : 'default'} size="sm">
          {hasRun ? '已执行' : '待执行'}
        </Badge>
      </div>

      {/* 输出 */}
      {output && (
        <div className="bg-primary rounded-lg p-3 text-sm font-mono text-gray-400">
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  )
}
