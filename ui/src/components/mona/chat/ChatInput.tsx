import { useCallback, useState } from "react"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments"
import { SpeechInput } from "@/components/ai-elements/speech-input"
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input"
import type { FileUIPart } from "ai"
import type { ChatStatus } from "ai"

const AttachmentItem = ({
  attachment,
  onRemove,
}: {
  attachment: FileUIPart & { id: string }
  onRemove: (id: string) => void
}) => {
  const handleRemove = useCallback(() => onRemove(attachment.id), [onRemove, attachment.id])
  return (
    <Attachment data={attachment} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  )
}

const AttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments()
  const handleRemove = useCallback((id: string) => attachments.remove(id), [attachments])
  if (attachments.files.length === 0) return null
  return (
    <Attachments variant="inline">
      {attachments.files.map((a) => (
        <AttachmentItem key={a.id} attachment={a} onRemove={handleRemove} />
      ))}
    </Attachments>
  )
}

interface ChatInputProps {
  status: ChatStatus
  onSubmit: (message: PromptInputMessage) => void
  onStop?: () => void
}

export function ChatInput({ status, onSubmit, onStop }: ChatInputProps) {
  const [text, setText] = useState("")

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value),
    [],
  )

  const handleTranscription = useCallback((t: string) => {
    setText((prev) => (prev ? `${prev} ${t}` : t))
  }, [])

  const handleSubmit = useCallback(
    (msg: PromptInputMessage) => {
      if (!msg.text?.trim() && !msg.files?.length) return
      onSubmit(msg)
      setText("")
    },
    [onSubmit],
  )

  const isStreaming = status === "streaming" || status === "submitted"
  const isDisabled = !text.trim() && !isStreaming

  return (
    <div className="px-3 pb-3 pt-2">
      <PromptInput globalDrop multiple onSubmit={handleSubmit}>
        <AttachmentsDisplay />
        <PromptInputBody>
          <PromptInputTextarea
            onChange={handleTextChange}
            value={text}
            placeholder="发送消息给 Mona..."
            className="min-h-10 max-h-36 text-xs"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <SpeechInput
              className="shrink-0"
              onTranscriptionChange={handleTranscription}
              size="icon-sm"
              variant="ghost"
            />
          </PromptInputTools>
          <PromptInputSubmit disabled={isDisabled} status={status} onStop={onStop} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
