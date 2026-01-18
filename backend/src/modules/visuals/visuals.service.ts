import prisma from '../../lib/prisma.js'
import type { Prisma } from '@prisma/client'

export class VisualsService {
  async create(userId: string, templateId: string) {
    // Get template
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      throw new Error('TEMPLATE_NOT_FOUND')
    }

    // Create visual from template
    const visual = await prisma.visual.create({
      data: {
        name: `Novo ${template.name}`,
        userId,
        templateId,
        styleConfig: template.defaultStyleConfig,
        spec: template.spec,
        status: 'DRAFT',
      },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            thumbnail: true,
          },
        },
      },
    })

    return visual
  }

  async getAll(userId: string) {
    const visuals = await prisma.visual.findMany({
      where: { userId },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            thumbnail: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return visuals
  }

  async getById(visualId: string, userId: string) {
    const visual = await prisma.visual.findFirst({
      where: {
        id: visualId,
        userId,
      },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            thumbnail: true,
            sampleData: true,
          },
        },
      },
    })

    if (!visual) {
      throw new Error('VISUAL_NOT_FOUND')
    }

    return visual
  }

  async update(
    visualId: string,
    userId: string,
    data: {
      name?: string
      description?: string
      styleConfig?: any
      spec?: any
      userData?: any
      status?: 'DRAFT' | 'COMPLETED'
    }
  ) {
    const visual = await prisma.visual.updateMany({
      where: {
        id: visualId,
        userId, // Ensure ownership
      },
      data,
    })

    if (visual.count === 0) {
      throw new Error('VISUAL_NOT_FOUND')
    }

    // Return updated visual
    return this.getById(visualId, userId)
  }

  async delete(visualId: string, userId: string) {
    const result = await prisma.visual.deleteMany({
      where: {
        id: visualId,
        userId, // Ensure ownership
      },
    })

    if (result.count === 0) {
      throw new Error('VISUAL_NOT_FOUND')
    }
  }

  async exportToDeneb(visualId: string, userId: string) {
    const visual = await this.getById(visualId, userId)

    // Build Deneb-compatible JSON
    const specification = {
      ...(visual.spec as any),
      usermeta: {
        deneb: {
          build: '1.6.2.1',
          metaVersion: 1,
          provider: 'vegaLite',
          providerVersion: '5.16.3',
        },
      },
    }

    // Config for cross-filtering (if params exist)
    const config: any = {}

    const spec = visual.spec as any
    if (spec.params && Array.isArray(spec.params)) {
      const selections: Record<string, any> = {}

      spec.params.forEach((param: any) => {
        if (param.select && param.select.fields) {
          selections[param.name] = param.select.fields.map((field: string) => ({
            key: field,
            fields: [field],
            identityExpression: {
              expr: `'dataset'[${field}]`,
            },
          }))
        }
      })

      if (Object.keys(selections).length > 0) {
        config.selection = selections
      }
    }

    return {
      specification,
      config: Object.keys(config).length > 0 ? config : {},
    }
  }
}

export default new VisualsService()
