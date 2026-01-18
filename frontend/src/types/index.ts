// User types
export interface User {
  id: string
  email: string
  name: string | null
  plan: 'FREE' | 'PREMIUM'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface PlanLimits {
  dailyVisualsLimit: number
  dailyVisualsCreated: number
  canCreateVisual: boolean
  isPremium: boolean
}

// Vega types
export interface VegaLiteSpec {
  $schema: string
  description?: string
  data?: any
  mark: any
  encoding?: any
  params?: any[]
  transform?: any[]
  config?: any
  [key: string]: any
}

// Template types
export interface Template {
  id: string
  name: string
  description: string
  category: 'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'heatmap'
  thumbnail: string
  spec: VegaLiteSpec
  defaultStyleConfig: StyleConfig
  requiredFields: any
  sampleData: any[]
  tags: string[]
  isPremium: boolean
  createdAt: string
  updatedAt: string
}

// Visual types
export interface Visual {
  id: string
  name: string
  description: string | null
  userId: string
  templateId: string
  template?: {
    name: string
    category: string
    thumbnail: string
    sampleData?: any[]
    spec?: VegaLiteSpec
    defaultStyleConfig?: StyleConfig
  }
  styleConfig: StyleConfig
  spec: VegaLiteSpec
  userData: any[] | null
  status: 'DRAFT' | 'COMPLETED'
  createdAt: string
  updatedAt: string
}

// Style config (flat structure for UI)
export interface StyleConfig {
  // Background
  background: string

  // Colors
  primaryColor: string
  colorScheme: string

  // Borders
  showBorders: boolean
  borderColor: string
  borderWidth: number

  // Axes
  xAxisTitle: string
  yAxisTitle: string
  showXAxis: boolean
  showYAxis: boolean
  showGrid: boolean

  // Tooltip
  showTooltip: boolean

  // Conditional rules
  conditionalRules: ConditionalRule[]

  // Interactive
  enableSelection: boolean
  selectionType: 'point' | 'interval'
}

export interface ConditionalRule {
  id: string
  condition: string
  color: string
}

// API Error
export interface ApiError {
  error: string
  message: string
  upgradeUrl?: string
}
