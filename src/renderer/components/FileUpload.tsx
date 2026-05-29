import React, { useState } from 'react'
import { useAI } from '../hooks/useAI'
import Button from './ui/Button'
import { FileText, X } from 'lucide-react'

interface UploadedFile {
  path: string
  name: string
  content: string
}

interface FileUploadProps {
  onFilesChange?: (files: UploadedFile[]) => void
}

export default function FileUpload({ onFilesChange }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleSelectFiles = async () => {
    try {
      setIsUploading(true)

      // 调用 Electron 文件选择
      const result = await window.electronAPI.file.select()
      if (!result) return

      // 读取文件内容
      const content = await window.electronAPI.file.read(result)
      const fileName = result.split('/').pop() || result

      const newFile: UploadedFile = {
        path: result,
        name: fileName,
        content
      }

      const updatedFiles = [...files, newFile]
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    } catch (error) {
      console.error('File upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  return (
    <div className="flex items-center gap-2">
      {/* 已上传的文件 */}
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
        >
          <FileText className="w-3 h-3 text-accent" />
          <span className="max-w-[100px] truncate">{file.name}</span>
          <button
            onClick={() => handleRemoveFile(index)}
            className="text-gray-500 hover:text-danger"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* 上传按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSelectFiles}
        disabled={isUploading}
      >
        {isUploading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加文件
          </>
        )}
      </Button>
    </div>
  )
}
