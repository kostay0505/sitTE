import { useState, useCallback } from 'react';
import { apiUrl } from '@/api/api';
import Image from 'next/image';

interface SortableFileManagerProps {
  files: (string | File)[] | string | File | null;
  onFilesChange: (files: (string | File)[] | string | File | null) => void;
  accept?: string;
  multiple?: boolean;
  fieldName: string;
  label?: string;
}

export function SortableFileManager({
  files,
  onFilesChange,
  accept,
  multiple = false,
  fieldName,
  label = 'файл'
}: SortableFileManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const normalizedFiles: (string | File)[] = (() => {
    if (!files) return [];
    if (Array.isArray(files)) return files;
    return [files];
  })();

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (newFiles && newFiles.length > 0) {
      const filesArray = Array.from(newFiles);

      if (multiple) {
        const updatedFiles = [...normalizedFiles, ...filesArray];
        onFilesChange(updatedFiles);
      } else {
        onFilesChange(filesArray[0]);
      }
    }
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = normalizedFiles.filter((_, i) => i !== index);

    if (multiple) {
      onFilesChange(newFiles);
    } else {
      onFilesChange(newFiles.length > 0 ? newFiles[0] : null);
    }
  };

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newFiles = [...normalizedFiles];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);

    onFilesChange(newFiles);
  }, [normalizedFiles, onFilesChange]);

  const moveFileUp = (index: number) => {
    if (index > 0) {
      moveFile(index, index - 1);
    }
  };

  const moveFileDown = (index: number) => {
    if (index < normalizedFiles.length - 1) {
      moveFile(index, index + 1);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveFile(draggedIndex, dropIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getFileUrl = (file: string | File) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return `${apiUrl}/files/${file}`;
  };

  const getFileName = (file: string | File, index: number) => {
    let fileName: string;
    const maxNameLength = 50;

    if (file instanceof File) {
      fileName = file.name;
    } else {
      fileName = file.split('/').pop() || file || `Файл ${index + 1}`;
    }

    if (fileName.length > maxNameLength) {
      const lastDotIndex = fileName.lastIndexOf('.');

      if (lastDotIndex !== -1 && lastDotIndex > 0) {
        const extension = fileName.substring(lastDotIndex);
        const nameWithoutExtension = fileName.substring(0, lastDotIndex);
        const nameLength = maxNameLength - 3 - extension.length;

        if (nameLength > 0) {
          return nameWithoutExtension.substring(0, nameLength) + '...' + extension;
        } else {
          return fileName.substring(0, maxNameLength - 3) + '...';
        }
      } else {
        return fileName.substring(0, maxNameLength - 3) + '...';
      }
    }

    return fileName;
  };

  const isImageFile = (file: string | File) => {
    const fileName = file instanceof File ? file.name : file;
    const mimeType = file instanceof File ? file.type : '';
    return mimeType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
  };

  const isVideoFile = (file: string | File) => {
    const fileName = file instanceof File ? file.name : file;
    const mimeType = file instanceof File ? file.type : '';
    return mimeType.startsWith('video/') || /\.(mp4|webm|ogg|avi|mov|wmv|flv|3gp)$/i.test(fileName);
  };

  const renderFilePreview = (file: string | File, index: number) => {
    const fileUrl = getFileUrl(file);
    const fileName = getFileName(file, index);
    const isDragged = draggedIndex === index;
    const isDragOver = dragOverIndex === index;

    const containerStyle: React.CSSProperties = {
      position: 'relative',
      border: `2px solid ${isDragOver ? '#3b82f6' : '#e5e7eb'}`,
      borderRadius: '8px',
      overflow: 'hidden',
      opacity: isDragged ? 0.5 : 1,
      transform: isDragged ? 'rotate(5deg)' : 'none',
      transition: 'all 0.2s ease',
      cursor: 'grab',
      backgroundColor: isDragOver ? '#eff6ff' : 'white'
    };

    if (isImageFile(file) || isVideoFile(file)) {
      return (
        <div
          key={index}
          style={containerStyle}
          draggable={multiple}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
        >
          {/* Индекс позиции */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            {index + 1}
          </div>

          {/* Превью изображения/видео */}
          {isImageFile(file) ? (
            <Image
              src={fileUrl}
              alt={fileName}
              width={120}
              height={80}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '80px'
              }}
              unoptimized
            />
          ) : (
            <video
              src={fileUrl}
              style={{
                width: '100%',
                height: '80px',
                objectFit: 'cover'
              }}
              controls={false}
              muted
            />
          )}

          {/* Кнопки управления */}
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            {/* Кнопка удаления */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile(index);
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
                lineHeight: '1'
              }}
              title="Удалить файл"
            >
              ×
            </button>

            {/* Кнопки перемещения (только для множественных файлов) */}
            {multiple && normalizedFiles.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveFileUp(index);
                  }}
                  disabled={index === 0}
                  style={{
                    background: index === 0 ? 'rgba(156, 163, 175, 0.9)' : 'rgba(59, 130, 246, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '10px',
                    lineHeight: '1'
                  }}
                  title="Переместить вверх"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveFileDown(index);
                  }}
                  disabled={index === normalizedFiles.length - 1}
                  style={{
                    background: index === normalizedFiles.length - 1 ? 'rgba(156, 163, 175, 0.9)' : 'rgba(59, 130, 246, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: index === normalizedFiles.length - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '10px',
                    lineHeight: '1'
                  }}
                  title="Переместить вниз"
                >
                  ↓
                </button>
              </>
            )}
          </div>

          {/* Название файла */}
          <div style={{
            padding: '4px 8px',
            fontSize: '10px',
            color: '#6b7280',
            textAlign: 'center',
            background: '#f9fafb',
            borderTop: '1px solid #e5e7eb'
          }}>
            {fileName}
          </div>

          {/* Индикатор перетаскивания */}
          {multiple && (
            <div style={{
              position: 'absolute',
              bottom: '25px',
              right: '4px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              borderRadius: '3px',
              padding: '2px 4px',
              fontSize: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              <span>⋮⋮</span>
            </div>
          )}
        </div>
      );
    }

    // Для обычных файлов
    return (
      <div
        key={index}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: '#f9fafb'
        }}
        draggable={multiple}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
            {index + 1}. {fileName}
          </div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              color: '#3b82f6',
              textDecoration: 'none'
            }}
          >
            Открыть файл
          </a>
        </div>

        {multiple && normalizedFiles.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              type="button"
              onClick={() => moveFileUp(index)}
              disabled={index === 0}
              style={{
                background: index === 0 ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '10px',
                cursor: index === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveFileDown(index)}
              disabled={index === normalizedFiles.length - 1}
              style={{
                background: index === normalizedFiles.length - 1 ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '10px',
                cursor: index === normalizedFiles.length - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ↓
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => handleRemoveFile(index)}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Удалить
        </button>
      </div>
    );
  };

  const hasMediaFiles = normalizedFiles.some(file => isImageFile(file) || isVideoFile(file));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Информация о перетаскивании */}
      {multiple && normalizedFiles.length > 1 && hasMediaFiles && (
        <div style={{
          padding: '8px 12px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#1e40af'
        }}>
          💡 Перетаскивайте файлы для изменения порядка или используйте кнопки ↑↓
        </div>
      )}

      {/* Отображение файлов */}
      {normalizedFiles.length > 0 && (
        <div style={hasMediaFiles ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px'
        } : {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {normalizedFiles.map((file, index) => renderFilePreview(file, index))}
        </div>
      )}

      {/* Кнопка добавления файлов */}
      <div>
        <input
          type="file"
          id={`file-input-${fieldName}`}
          accept={accept}
          multiple={multiple}
          onChange={handleAddFiles}
          style={{ display: 'none' }}
        />
        <label
          htmlFor={`file-input-${fieldName}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6b7280',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#9ca3af';
            e.currentTarget.style.color = '#4b5563';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          {normalizedFiles.length === 0
            ? `+ Выбрать файлы`
            : `+ Добавить еще файлы`
          }
        </label>
      </div>
    </div>
  );
} 