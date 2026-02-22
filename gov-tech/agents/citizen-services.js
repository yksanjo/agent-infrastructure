/**
 * Citizen Services Agent
 * Handles citizen inquiries, service requests, and routing
 */

const { EventEmitter } = require('events');

// Department knowledge base
const DEPARTMENTS = [
  {
    id: 'dmv',
    name: 'Department of Motor Vehicles',
    keywords: ['license', 'registration', 'vehicle', 'car', 'driver', 'renewal', 'permit'],
    contactInfo: { phone: '1-800-777-0133', email: 'dmv@example.gov', hours: 'Mon-Fri 8am-5pm' }
  },
  {
    id: 'tax',
    name: 'Tax Collector',
    keywords: ['tax', 'property tax', 'income tax', 'payment', 'refund'],
    contactInfo: { phone: '1-800-555-0123', email: 'tax@example.gov', hours: 'Mon-Fri 9am-4pm' }
  },
  {
    id: 'public-works',
    name: 'Public Works',
    keywords: ['pothole', 'street', 'signal', 'light', 'sidewalk', 'trash', 'recycling'],
    contactInfo: { phone: '1-800-555-0456', email: 'pworks@example.gov', hours: 'Mon-Fri 7am-3pm' }
  },
  {
    id: 'planning',
    name: 'Planning & Building',
    keywords: ['permit', 'building', 'zoning', 'inspection', 'planning', 'land use'],
    contactInfo: { phone: '1-800-555-0789', email: 'planning@example.gov', hours: 'Mon-Fri 8am-4pm' }
  },
  {
    id: 'social-services',
    name: 'Social Services',
    keywords: ['benefits', 'welfare', 'food stamps', 'medicaid', 'housing', 'assistance'],
    contactInfo: { phone: '1-800-555-0321', email: 'social@example.gov', hours: 'Mon-Fri 8am-5pm' }
  }
];

/** @typedef {{citizenId?: string, inquiry: string, channel: string, language?: string, accessibilityNeeds?: boolean, jurisdiction?: string}} CitizenRequest */
/** @typedef {{response: string, department?: string, nextSteps?: string[], resources?: any[], ticketId?: string}} CitizenResponse */

class CitizenServicesAgent extends EventEmitter {
  /** @param {{jurisdiction?: string, defaultLanguage?: string, accessibilityMode?: boolean}} options */
  constructor(options = {}) {
    super();
    this.options = options;
    this.knowledgeBase = new Map();
    this.initializeKnowledgeBase();
  }

  initializeKnowledgeBase() {
    this.knowledgeBase.set('license renewal', 
      'You can renew your driver\'s license online at our DMV portal, by mail, or in person at any DMV office.');
    this.knowledgeBase.set('vehicle registration',
      'New vehicle registration can be completed online, by mail, or at the DMV.');
    this.knowledgeBase.set('trash pickup',
      'Trash is collected weekly on your scheduled day. Recycling is collected every other week.');
    this.knowledgeBase.set('pay water bill',
      'Water bills can be paid online, by phone, by mail, or in person at City Hall.');
    this.knowledgeBase.set('report pothole',
      'Potholes can be reported using our SeeClickFix mobile app or online portal.');
    this.knowledgeBase.set('apply permit',
      'Permit applications can be submitted online through the Permits Plus portal.');
  }

  /** @param {CitizenRequest} request */
  async handleInquiry(request) {
    this.emit('inquiry-received', request);
    
    const { inquiry, language = 'en', accessibilityNeeds = false } = request;
    const lowerInquiry = inquiry.toLowerCase();
    
    const department = this.routeToDepartment(lowerInquiry);
    let answer = this.findKnowledgeAnswer(lowerInquiry);

    const response = {
      response: answer,
      department: department?.name,
      nextSteps: this.generateNextSteps(lowerInquiry),
      resources: this.findResources(lowerInquiry),
      ticketId: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    };

    this.emit('inquiry-resolved', response);
    return response;
  }

  routeToDepartment(inquiry) {
    let bestMatch = null;
    let maxScore = 0;

    for (const dept of DEPARTMENTS) {
      let score = 0;
      for (const keyword of dept.keywords) {
        if (inquiry.includes(keyword)) score++;
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = dept;
      }
    }
    return bestMatch;
  }

  findKnowledgeAnswer(inquiry) {
    for (const [key, answer] of this.knowledgeBase) {
      if (inquiry.includes(key)) return answer;
    }
    return 'For this specific inquiry, please contact the appropriate department directly.';
  }

  findResources(inquiry) {
    const resources = [];
    if (inquiry.includes('license') || inquiry.includes('vehicle')) {
      resources.push({ title: 'DMV Online Services', url: 'https://dmv.example.gov/online', type: 'website' });
    }
    if (inquiry.includes('permit')) {
      resources.push({ title: 'Permit Portal', url: 'https://permits.example.gov', type: 'website' });
    }
    resources.push({ title: 'Citizen Portal', url: 'https://citizen.example.gov', type: 'website' });
    return resources;
  }

  generateNextSteps(inquiry) {
    const steps = [];
    if (inquiry.includes('renew')) {
      steps.push('Visit the online renewal portal');
      steps.push('Have your current license ready');
    } else if (inquiry.includes('report')) {
      steps.push('Use SeeClickFix app or online portal');
      steps.push('Provide location details');
    } else {
      steps.push('Visit citizen portal');
      steps.push('Call 311 for assistance');
    }
    return steps;
  }
}

module.exports = { CitizenServicesAgent };
