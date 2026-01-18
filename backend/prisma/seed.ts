import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing templates
  await prisma.template.deleteMany()

  // Create templates
  const templates = [
    {
      name: 'Barra Vertical',
      description: 'Gráfico de barras verticais para comparação categórica',
      category: 'bar',
      thumbnail: '/templates/bar-vertical.png',
      tags: ['básico', 'comparação', 'categorias'],
      isPremium: false,
      spec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        mark: { type: 'bar', tooltip: true },
        encoding: {
          x: { field: 'category', type: 'nominal', axis: { title: 'Categoria' } },
          y: { field: 'value', type: 'quantitative', axis: { title: 'Valor' } },
          color: { field: 'category', type: 'nominal', legend: null },
        },
      },
      defaultStyleConfig: {
        background: '#ffffff',
        primaryColor: '#3498db',
        colorScheme: 'category10',
        showBorders: false,
        borderColor: '#000000',
        borderWidth: 1,
        xAxisTitle: 'Categoria',
        yAxisTitle: 'Valor',
        showXAxis: true,
        showYAxis: true,
        showGrid: true,
        showTooltip: true,
        conditionalRules: [],
        enableSelection: false,
        selectionType: 'point',
      },
      requiredFields: {
        x: { name: 'category', type: 'nominal' },
        y: { name: 'value', type: 'quantitative' },
      },
      sampleData: [
        { category: 'A', value: 100 },
        { category: 'B', value: 200 },
        { category: 'C', value: 150 },
        { category: 'D', value: 300 },
        { category: 'E', value: 250 },
      ],
    },
    {
      name: 'Linha Simples',
      description: 'Gráfico de linha para visualizar tendências ao longo do tempo',
      category: 'line',
      thumbnail: '/templates/line-simple.png',
      tags: ['temporal', 'tendência', 'série temporal'],
      isPremium: false,
      spec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        mark: { type: 'line', point: true, tooltip: true },
        encoding: {
          x: { field: 'date', type: 'temporal', axis: { title: 'Data' } },
          y: { field: 'value', type: 'quantitative', axis: { title: 'Valor' } },
          color: { value: '#3498db' },
        },
      },
      defaultStyleConfig: {
        background: '#ffffff',
        primaryColor: '#3498db',
        colorScheme: 'category10',
        showBorders: false,
        borderColor: '#000000',
        borderWidth: 1,
        xAxisTitle: 'Data',
        yAxisTitle: 'Valor',
        showXAxis: true,
        showYAxis: true,
        showGrid: true,
        showTooltip: true,
        conditionalRules: [],
        enableSelection: false,
        selectionType: 'point',
      },
      requiredFields: {
        x: { name: 'date', type: 'temporal' },
        y: { name: 'value', type: 'quantitative' },
      },
      sampleData: [
        { date: '2024-01-01', value: 100 },
        { date: '2024-02-01', value: 150 },
        { date: '2024-03-01', value: 130 },
        { date: '2024-04-01', value: 200 },
        { date: '2024-05-01', value: 180 },
      ],
    },
    {
      name: 'Pizza (Donut)',
      description: 'Gráfico de pizza para mostrar proporções',
      category: 'pie',
      thumbnail: '/templates/pie-donut.png',
      tags: ['proporção', 'percentual', 'partes'],
      isPremium: false,
      spec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        mark: { type: 'arc', innerRadius: 50, tooltip: true },
        encoding: {
          theta: { field: 'value', type: 'quantitative' },
          color: { field: 'category', type: 'nominal' },
        },
      },
      defaultStyleConfig: {
        background: '#ffffff',
        primaryColor: '#3498db',
        colorScheme: 'category10',
        showBorders: false,
        borderColor: '#000000',
        borderWidth: 1,
        xAxisTitle: '',
        yAxisTitle: '',
        showXAxis: false,
        showYAxis: false,
        showGrid: false,
        showTooltip: true,
        conditionalRules: [],
        enableSelection: false,
        selectionType: 'point',
      },
      requiredFields: {
        theta: { name: 'value', type: 'quantitative' },
        color: { name: 'category', type: 'nominal' },
      },
      sampleData: [
        { category: 'A', value: 100 },
        { category: 'B', value: 200 },
        { category: 'C', value: 150 },
        { category: 'D', value: 120 },
      ],
    },
    {
      name: 'Scatter Plot',
      description: 'Gráfico de dispersão para correlações',
      category: 'scatter',
      thumbnail: '/templates/scatter.png',
      tags: ['correlação', 'dispersão', 'análise'],
      isPremium: true,
      spec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        mark: { type: 'point', tooltip: true, filled: true, size: 100 },
        encoding: {
          x: { field: 'x', type: 'quantitative', axis: { title: 'Eixo X' } },
          y: { field: 'y', type: 'quantitative', axis: { title: 'Eixo Y' } },
          color: { field: 'category', type: 'nominal' },
        },
      },
      defaultStyleConfig: {
        background: '#ffffff',
        primaryColor: '#3498db',
        colorScheme: 'category10',
        showBorders: false,
        borderColor: '#000000',
        borderWidth: 1,
        xAxisTitle: 'Eixo X',
        yAxisTitle: 'Eixo Y',
        showXAxis: true,
        showYAxis: true,
        showGrid: true,
        showTooltip: true,
        conditionalRules: [],
        enableSelection: false,
        selectionType: 'point',
      },
      requiredFields: {
        x: { name: 'x', type: 'quantitative' },
        y: { name: 'y', type: 'quantitative' },
      },
      sampleData: [
        { x: 10, y: 20, category: 'A' },
        { x: 20, y: 30, category: 'A' },
        { x: 15, y: 25, category: 'B' },
        { x: 30, y: 40, category: 'B' },
        { x: 25, y: 35, category: 'C' },
      ],
    },
    {
      name: 'Área Empilhada',
      description: 'Gráfico de área para mostrar evolução de múltiplas séries',
      category: 'area',
      thumbnail: '/templates/area-stacked.png',
      tags: ['temporal', 'empilhado', 'múltiplas séries'],
      isPremium: true,
      spec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        mark: { type: 'area', tooltip: true },
        encoding: {
          x: { field: 'date', type: 'temporal', axis: { title: 'Data' } },
          y: { field: 'value', type: 'quantitative', axis: { title: 'Valor' } },
          color: { field: 'category', type: 'nominal' },
        },
      },
      defaultStyleConfig: {
        background: '#ffffff',
        primaryColor: '#3498db',
        colorScheme: 'category10',
        showBorders: false,
        borderColor: '#000000',
        borderWidth: 1,
        xAxisTitle: 'Data',
        yAxisTitle: 'Valor',
        showXAxis: true,
        showYAxis: true,
        showGrid: true,
        showTooltip: true,
        conditionalRules: [],
        enableSelection: false,
        selectionType: 'point',
      },
      requiredFields: {
        x: { name: 'date', type: 'temporal' },
        y: { name: 'value', type: 'quantitative' },
      },
      sampleData: [
        { date: '2024-01', value: 100, category: 'A' },
        { date: '2024-01', value: 80, category: 'B' },
        { date: '2024-02', value: 120, category: 'A' },
        { date: '2024-02', value: 90, category: 'B' },
        { date: '2024-03', value: 110, category: 'A' },
        { date: '2024-03', value: 100, category: 'B' },
      ],
    },
  ]

  for (const template of templates) {
    await prisma.template.create({
      data: template as any,
    })
  }

  console.log(`✅ Created ${templates.length} templates`)
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
