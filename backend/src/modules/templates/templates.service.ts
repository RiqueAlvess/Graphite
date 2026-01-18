import prisma from '../../lib/prisma.js'

export class TemplatesService {
  async getAll(userPlan?: 'FREE' | 'PREMIUM') {
    // If FREE user, hide premium templates
    const where = userPlan === 'FREE' ? { isPremium: false } : {}

    const templates = await prisma.template.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return templates
  }

  async getById(id: string) {
    const template = await prisma.template.findUnique({
      where: { id },
    })

    if (!template) {
      throw new Error('TEMPLATE_NOT_FOUND')
    }

    return template
  }
}

export default new TemplatesService()
