---
allowed-tools: [Read, Write, Grep, Glob, Task, Bash]
---

# Optimize UX - AI Judge User Experience Enhancement

## Purpose
Enhance the AI Judge application's user experience with smooth interactions, clear feedback, and intuitive workflows for evaluation management.

## Core UX Improvements for AI Judge

### 1. File Upload Experience
- **Drag-and-drop zone**: Visual feedback on hover/drag
- **Upload progress**: Real-time progress bar with percentage
- **Validation feedback**: Instant schema validation messages
- **Success confirmation**: Clear indication of successful upload
- **File preview**: Show parsed data summary before confirmation

### 2. Judge Management UI
- **Form autosave**: Save drafts automatically
- **Prompt templates**: Provide example prompts for common cases
- **Model comparison**: Show model capabilities and costs
- **Inline editing**: Edit judges without modal dialogs
- **Status indicators**: Visual active/inactive states

### 3. Evaluation Flow
- **Queue visualization**: Show evaluation pipeline clearly
- **Progress tracking**: Real-time updates during execution
- **Pause/resume**: Allow interruption without data loss
- **Cost estimation**: Show estimated API costs before running
- **Batch controls**: Select multiple items for evaluation

### 4. Results Display
- **Smart filtering**: Multi-select with instant results
- **Data virtualization**: Handle thousands of results smoothly
- **Expandable rows**: Show full reasoning on demand
- **Statistics dashboard**: Visual charts for pass rates
- **Export options**: One-click export to CSV/JSON

### 5. Error Recovery
- **Graceful failures**: Never lose user data
- **Retry logic**: Automatic retry with backoff
- **Partial success**: Continue despite individual failures
- **Clear messaging**: Explain what went wrong and how to fix

## AI Judge Specific Implementations

```typescript
// 1. File Upload with Progress
const FileUpload = () => {
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  
  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    
    if (file?.type === 'application/json') {
      await processFile(file)
    } else {
      showError('Please upload a JSON file')
    }
  }
  
  const processFile = async (file: File) => {
    setProgress(10)
    const content = await file.text()
    setProgress(30)
    
    try {
      const data = JSON.parse(content)
      setProgress(50)
      await validateSchema(data)
      setProgress(70)
      await uploadToDatabase(data)
      setProgress(100)
      showSuccess('File uploaded successfully!')
    } catch (error) {
      showError(getErrorMessage(error))
    }
  }
}

// 2. Judge Management with Optimistic Updates
const useJudgeManagement = () => {
  const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['items'])
    
    // Snapshot previous value
    const previousItems = queryClient.getQueryData(['items'])
    
    // Optimistically update
    queryClient.setQueryData(['items'], old => ({
      ...old,
      items: old.items.map(item => 
        item.id === newData.id ? { ...item, ...newData } : item
      )
    }))
    
    return { previousItems }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['items'], context.previousItems)
    toast.error('Update failed. Please try again.')
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries(['items'])
  }
})

// 2. Intelligent Prefetching
const prefetchNextPage = async (currentPage) => {
  await queryClient.prefetchQuery({
    queryKey: ['items', { page: currentPage + 1 }],
    queryFn: () => fetchItems({ page: currentPage + 1 }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// 3. Skeleton Loading
const ItemSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </div>
)

// 4. Virtual Scrolling for Lists
import { useVirtual } from '@tanstack/react-virtual'

const VirtualList = ({ items }) => {
  const parentRef = useRef()
  const rowVirtualizer = useVirtual({
    size: items.length,
    parentRef,
    estimateSize: useCallback(() => 50, []),
  })
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${rowVirtualizer.totalSize}px` }}>
        {rowVirtualizer.virtualItems.map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ItemRow item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}

// 5. Evaluation Progress Tracker
const EvaluationProgress = () => {
  const [status, setStatus] = useState<EvaluationStatus>()
  
  return (
    <div className="evaluation-progress">
      <div className="progress-header">
        <h3>Running Evaluations</h3>
        <span>{status.completed} / {status.total}</span>
      </div>
      <ProgressBar value={status.percentage} />
      <div className="progress-details">
        <span>✅ Passed: {status.passed}</span>
        <span>❌ Failed: {status.failed}</span>
        <span>❓ Inconclusive: {status.inconclusive}</span>
      </div>
      {status.errors.length > 0 && (
        <ErrorList errors={status.errors} onRetry={retryFailed} />
      )}
    </div>
  )
}
```

## Key Patterns to Apply

### 1. State Transition Animations
```css
/* Smooth state transitions */
.fade-enter {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 200ms ease-out;
}
```

### 2. Loading State Hierarchy
```typescript
// Priority: Local state > Cached data > Loading > Error
const DataDisplay = () => {
  const { data, isLoading, error, isFetching } = useQuery(...)
  
  // Show stale data while refetching
  if (data && isFetching) {
    return <DataView data={data} isRefreshing />
  }
  
  if (isLoading) return <Skeleton />
  if (error) return <ErrorBoundary error={error} />
  
  return <DataView data={data} />
}
```

### 3. Predictive Actions
```typescript
// Preload data on hover
const LinkWithPrefetch = ({ to, children }) => (
  <Link
    to={to}
    onMouseEnter={() => prefetchRoute(to)}
    onFocus={() => prefetchRoute(to)}
  >
    {children}
  </Link>
)
```

## AI Judge Specific UX Patterns

1. **Submission Management**
   - Visual queue hierarchy
   - Bulk operations support
   - Quick filters by queue/status
   - Submission preview modal

2. **Judge Assignment**
   - Drag-and-drop assignment
   - Bulk assign to questions
   - Visual assignment matrix
   - Quick toggle active judges

3. **Evaluation Monitoring**
   - Real-time status updates
   - Queue position indicator
   - Estimated completion time
   - Cost accumulator display

4. **Results Analysis**
   - Interactive statistics charts
   - Verdict distribution graphs
   - Judge performance comparison
   - Export with filters applied

## Testing UX Improvements

```typescript
// Test optimistic updates
it('should update UI immediately and rollback on error', async () => {
  const { result } = renderHook(() => useOptimisticUpdate())
  
  // Trigger update
  act(() => {
    result.current.updateItem({ id: 1, name: 'Updated' })
  })
  
  // Check immediate update
  expect(screen.getByText('Updated')).toBeInTheDocument()
  
  // Simulate error
  await waitFor(() => {
    expect(screen.getByText('Original')).toBeInTheDocument()
  })
})
```

## Performance Metrics to Track

- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)
- API response times
- Error rates
- User engagement metrics

## Remember

- **Perceived performance > Actual performance**
- **Graceful degradation > Perfect features**
- **User feedback > Silent operations**
- **Progressive enhancement > All-or-nothing**
EOF < /dev/null
