import { atom } from 'recoil'

const worker = atom({
  key: 'chat_worker',
  default: new Worker('llm/worker.js'),
})

const modelLoaded = atom({
  key: 'modelLoaded',
  default: false,
})

const modelLoading = atom({
  key: 'modelLoading',
  default: false,
})

const modelSize = atom({
  key: 'modelSize',
  default: 0,
})

const loadedSize = atom({
  key: 'loadedSize',
  default: 0,
})

const loadedProgress = atom({
  key: 'loadProgress',
  default: 0,
})

const modelLoadLocal = atom({
  key: 'modelLoadLocal',
  default: [
    {
      name: '0.1B',
      url: './assets/models/RWKV-x070-World-0.1B-v2.8-20241210-ctx4096.st',
      key: undefined,
      sampler: {
        temperature: 2.0,
        top_p: 0.5,
        presence_penalty: 0.5,
        count_penalty: 0.5,
        half_life: 200,
      },
    },
    {
      name: '0.4B',
      url: './assets/models/0.4B-20250107-ctx4096.st',
      key: undefined,
      sampler: {
        temperature: 1.0,
        top_p: 0.5,
        presence_penalty: 0.5,
        count_penalty: 0.5,
        half_life: 200,
      },
    },
  ],
})

const modelLoadRemote = atom({
  key: 'modelLoadRemote',
  default: [
    {
      name: '0.1B',
      url: 'https://api-image.rwkvos.com/download/RWKV-x070-World-0.1B-v2.8-20241210-ctx4096.st',
      key: '4s5aWqs2f4PzKfgLjuRZgXKvvmal5Z5iq0OzkTPwaA2axgNgSbayfQEX5FgOpTxyyeUM4gsFHHDZroaFDIE3NtSJD6evdz3lAVctyN026keeXMoJ7tmUy5zriMJHJ9aM',

      sampler: {
        temperature: 2.0,
        top_p: 0.5,
        presence_penalty: 0.5,
        count_penalty: 0.5,
        half_life: 200,
      },
    },
    {
      name: '0.4B',
      url: 'https://api-image.rwkvos.com/download/0.4B-20250107-ctx4096.st',
      key: undefined,
      sampler: {
        temperature: 1.0,
        top_p: 0.5,
        presence_penalty: 0.5,
        count_penalty: 0.5,
        half_life: 200,
      },
    },
  ],
})

const modelLoadId = atom({
  key: 'modelLoadId',
  default: 0,
})

const samplerOptions = atom({
  key: 'samplerOptions',
  default: {
    temperature: 1.0,
    top_p: 0.5,
    presence_penalty: 0.5,
    count_penalty: 0.5,
    half_life: 200,
  },
})

const heartBeatSet = atom({
  key: 'heartBeatSet',
  default: false,
})

const introLong = `User: Hi!

Assistant: Hello! I'm your AI assistant. I'm here to help you with various tasks, such as answering questions, brainstorming ideas, drafting emails, writing code, providing advice, and much more.

User: Could you provide a comprehensive explanation of a project that adheres to the strictest regulatory compliance standards and follows the waterfall methodology? Please describe each of the five stages in detail, including all the specific tasks and deliverables associated with each stage, and use the [ project plan ] data type to clearly and concisely demonstrate your answer. Additionally, could you elaborate on any potential challenges that might arise during the implementation of this project and how they could be addressed?

Assistant: Certainly! Here is a comprehensive explanation of a project that adheres to the strictest regulatory compliance standards and follows the waterfall methodology:
Project Name: Regulatory Compliance System
Project Overview: The goal of this project is to develop a regulatory compliance system for a financial institution that adheres to the strictest regulatory compliance standards. The system will enable the institution to manage regulatory compliance requirements and ensure that all regulatory compliance policies and procedures are followed.
Stage 1: Requirements Gathering and Analysis
Tasks:
- Define project scope and objectives
- Identify stakeholders and gather requirements
- Analyze requirements and determine feasibility
- Create a requirements document
Deliverables:
- Project scope statement
- Stakeholder analysis report
- Requirements document
Project Plan:
| Task | Start Date | End Date | Duration |
|------|-----------|---------|----------|
| Define project scope and objectives | 1/1/2022 | 1/5/2022 | 4 days |
| Identify stakeholders and gather requirements | 1/6/2022 | 1/15/2022 | 10 days |
| Analyze requirements and determine feasibility | 1/16/2022 | 1/25/2022 | 10 days |
| Create a requirements document | 1/26/2022 | 1/31/2022 | 5 days |
Stage 2: Design
Tasks:
- Develop a system architecture
- Create detailed design specifications
- Develop a prototype
- Review and approve design documents
Deliverables:
- System architecture document
- Detailed design specifications document
- Prototype
- Design review report
Project Plan:
| Task | Start Date | End Date | Duration |
|------|-----------|---------|----------|
| Develop a system architecture | 2/1/2022 | 2/10/2022 | 10 days |
| Create detailed design specifications | 2/11/2022 | 2/20/2022 | 10 days |
| Develop a prototype | 2/21/2022 | 2/28/2022 | 7 days |
| Review and approve design documents | 3/1/2022 | 3/5/2022 | 5 days |
Stage 3: Implementation
Tasks:
- Develop code and scripts
- Conduct unit testing
- Conduct integration testing
- Conduct system testing
Deliverables:
- Code and scripts
- Unit test results
- Integration test results
- System test results
Project Plan:
| Task | Start Date | End Date | Duration |
|------|-----------|---------|----------|
| Develop code and scripts | 3/6/2022 | 4/10/2022 | 35 days |
| Conduct unit testing | 4/11/2022 | 4/20/2022 | 10 days |
| Conduct integration testing | 4/21/2022 | 5/5/2022 | 15 days |
| Conduct system testing | 5/6/2022 | 5/20/2022 | 15 days |
Stage 4: Deployment
Tasks:
- Install the system in the production environment
- Conduct user acceptance testing
- Train end-users
- Obtain sign-off from stakeholders
Deliverables:
- Deployed system
- User acceptance test results
- Training materials
- Sign-off document
Project Plan:
| Task | Start Date | End Date | Duration |
|------|-----------|---------|----------|
| Install the system in the production environment | 5/21/2022 | 5/25/2022 | 5 days |
| Conduct user acceptance testing | 5/26/2022 | 6/5/2022 | 10 days |
| Train end-users | 6/6/2022 | 6/15/2022 | 10 days |
| Obtain sign-off from stakeholders | 6/16/2022 | 6/20/2022 | 5 days |
Stage 5: Maintenance and Support
Tasks:
- Provide ongoing maintenance and support
- Conduct periodic system audits and reviews
- Implement updates and enhancements as needed
Deliverables:
- Maintenance and support documentation
- Audit and review reports
- Update and enhancement documentation
Project Plan:
| Task | Start Date | End Date | Duration |
|------|-----------|---------|----------|
| Provide ongoing maintenance and support | 6/21/2022 | Ongoing | N/A |
| Conduct periodic system audits and reviews | 6/21/2022 | Ongoing | N/A |
| Implement updates and enhancements as needed | 6/21/2022 | Ongoing | N/A |
Potential Challenges and Solutions:
- One potential challenge is the complexity of the regulatory compliance requirements. To address this, the project team can engage with regulatory compliance experts and conduct thorough research to ensure that all requirements are identified and addressed.
- Another potential challenge is ensuring that the system is fully compliant with all regulatory standards. To address this, the project team can conduct thorough testing and review by regulatory compliance experts to ensure that all standards are met.
- Additionally, ensuring that end-users are fully trained and understand the system can be a challenge. To address this, the project team can develop comprehensive training materials and conduct thorough training sessions to ensure that end-users are fully prepared to use the system.

User: Can you give a shorter explanation on the project plan?

Assistant: Certainly! Here's a condensed overview of the project plan for the Regulatory Compliance System:
**Project Plan Overview:**
1. **Requirements Gathering and Analysis (Jan 1 - Jan 31)**
   - Define scope, gather stakeholder requirements, analyze feasibility, and create a requirements document.
2. **Design (Feb 1 - Mar 5)**
   - Develop system architecture, create detailed designs, build a prototype, and review/approve design documents.
3. **Implementation (Mar 6 - May 20)**
   - Write code, conduct unit, integration, and system testing, producing test results.
4. **Deployment (May 21 - Jun 20)**
   - Install the system, perform user acceptance testing, train users, and get stakeholder sign-off.
5. **Maintenance and Support (Jun 21 - Ongoing)**
   - Provide continuous support, conduct audits, and implement updates/enhancements.
**Challenges & Solutions:**
- Complexity of compliance requirements: Engage experts and thorough research.
- Ensuring full compliance: Thorough testing and expert reviews.
- User training: Comprehensive materials and sessions.
This plan follows a structured waterfall methodology, ensuring each phase is completed before moving to the next.

User: Generate a unique metaphor for a heavy person.

Assistant: He was a human boulder, immovable and taking up a large amount of space.`

const intro = `User: Hi!

Assistant: Hello! I'm your AI assistant. I'm here to help you with various tasks, such as answering questions, brainstorming ideas, drafting emails, writing code, providing advice, and much more.

User: Why is the sky blue?

Assistant: The sky appears blue due to a phenomenon called Rayleigh scattering, which involves the scattering of sunlight by the molecules and small particles in Earth's atmosphere. Sunlight, which contains a spectrum of colors from red to violet, interacts with the nitrogen and oxygen molecules in the Earth's atmosphere. Among the colors in the visible spectrum, blue and violet have shorter wavelengths. These shorter wavelengths are more likely to be scattered in all directions by the air molecules. This scattering effect is known as Rayleigh scattering. Although violet light is also scattered, our eyes are more sensitive to blue light. Additionally, the scattering of blue light is more efficient, making the sky appear predominantly blue to our eyes.

User: What makes its color variant?

Assistant: The color of the sky can vary depending on the time of day, weather conditions, and atmospheric pollutants. For example, during sunrise and sunset, the sky can appear red or orange due to the longer path the sunlight travels through the atmosphere, scattering more of the blue light away. Moreover, air pollution and cloud cover can also affect the color of the sky, making it appear grey or white.`

const editingIndex = atom<string | number | null>({
  key: 'editingIndex',
  default: null,
})

const editingText = atom<string | undefined>({
  key: 'editingText',
  default: undefined,
})

export const P = {
  worker,
  modelLoaded,
  modelLoading,
  modelSize,
  loadedSize,
  loadedProgress,
  modelLoadLocal,
  modelLoadRemote,
  modelLoadId,
  samplerOptions,
  heartBeatSet,
  intro,
  editingIndex,
  editingText,
}
