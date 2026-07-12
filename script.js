/* ==========================================================================
   PARTICLE BACKGROUND ENGINE
   ========================================================================== */

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
let mouse = {
    x: null,
    y: null,
    radius: 160 // Interaction radius
};

// Handle window resizing
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
    if (typeof drawPipelineConnections === 'function') {
        drawPipelineConnections();
    }
});

// Track mouse position
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Clear mouse track on leave
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Track touch position for particle effects
window.addEventListener('touchmove', (event) => {
    if (event.touches.length === 1) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
    }
}, { passive: true });

window.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
});

// Spawn new particles on click
window.addEventListener('click', (event) => {
    // Only spawn particles if not clicking on UI buttons / interactive elements
    if (event.target.tagName !== 'BUTTON' && event.target.tagName !== 'A' && !event.target.closest('#azure-header') && !event.target.closest('#left-sidebar') && !event.target.closest('#resource-explorer') && !event.target.closest('#properties-pane')) {
        const count = 15;
        for (let i = 0; i < count; i++) {
            particlesArray.push(new Particle(event.clientX, event.clientY, true));
            if (particlesArray.length > 300) {
                particlesArray.shift(); // Keep count capped
            }
        }
    }
});

// Get theme colors for particles
function getParticleColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        return {
            particles: ['#00ffff', '#4ec9b0', '#0078d4', '#60cdff'],
            lines: 'rgba(78, 201, 176, 0.14)',
            mouseLines: 'rgba(0, 255, 255, 0.22)'
        };
    } else {
        return {
            particles: ['#0078d4', '#106ebe', '#50e6ff', '#005a9e'],
            lines: 'rgba(0, 120, 212, 0.1)',
            mouseLines: 'rgba(0, 90, 158, 0.16)'
        };
    }
}

// Particle constructor
class Particle {
    constructor(x, y, isExplosion = false) {
        this.x = x !== undefined ? x : Math.random() * canvas.width;
        this.y = y !== undefined ? y : Math.random() * canvas.height;
        this.radius = Math.random() * 3.0 + 1.2;
        
        // Velocity
        if (isExplosion) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        } else {
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
        }
        
        const colors = getParticleColors().particles;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.6 + 0.3;
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;

        // Wall collisions
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Mouse attraction/repulsion
        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                // Pull particles gently towards cursor
                const force = (mouse.radius - distance) / mouse.radius;
                this.x += (dx / distance) * force * 0.6;
                this.y += (dy / distance) * force * 0.6;
            }
        }
    }
}

// Connect nearby particles and cursor
function drawLines() {
    const colors = getParticleColors();
    ctx.lineWidth = 0.8;

    for (let i = 0; i < particlesArray.length; i++) {
        const p1 = particlesArray[i];

        // Lines to mouse
        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - p1.x;
            let dy = mouse.y - p1.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 240) {
                ctx.strokeStyle = colors.mouseLines;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }

        // Lines to other particles
        for (let j = i + 1; j < particlesArray.length; j++) {
            const p2 = particlesArray[j];
            let dx = p1.x - p2.x;
            let dy = p1.y - p2.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 140) {
                ctx.strokeStyle = colors.lines;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
}

// Populate background particles
function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesArray = [];
    
    // Choose density based on screen resolution
    const density = Math.floor((canvas.width * canvas.height) / 4500);
    const count = Math.min(density, 300); // Cap default particles at 300
    
    for (let i = 0; i < count; i++) {
        particlesArray.push(new Particle());
    }
}

// Particle Loop
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particlesArray.forEach(p => {
        p.update();
        p.draw();
    });
    
    drawLines();
    requestAnimationFrame(animateParticles);
}

// Initialize particles system
initParticles();
animateParticles();


/* ==========================================================================
   PORTFOLIO STATE AND DATA
   ========================================================================== */

const portfolioData = {
    pipelines: {
        pfizer: {
            id: 'pfizer',
            name: 'Pfizer_ClinicalData_Ingest',
            description: 'Modernizing legacy Java-based Talend workflows by migrating to Azure Databricks PySpark, featuring Unity Catalog governance and CI/CD via DAB.',
            parameters: [
                { name: 'Environment', type: 'String', value: 'Production' },
                { name: 'PipelineVersion', type: 'String', value: 'v2.4.1' },
                { name: 'PfizerSourceFolder', type: 'String', value: '/mnt/clinical-trial-source' },
                { name: 'MaxConcurrentRuns', type: 'Int32', value: 3 }
            ],
            activities: [
                {
                    id: 'talend_mig',
                    name: 'Talend_Migration',
                    type: 'copy',
                    x: 60, y: 150,
                    subtitle: 'Talend (Java) to PySpark Ingest',
                    desc: 'Migration and refactoring of 21+ legacy Java-based Talend ETL pipelines containing clinical trial datasets to optimized PySpark notebooks on Azure Databricks.',
                    settings: {
                        'Source Dataset': 'ds_Talend_API (REST Call)',
                        'Sink Dataset': 'ds_ADLS_Gen2_Delta (Raw Storage)',
                        'Codebase Shift': 'Legacy Java Jobs -> Python/PySpark',
                        'Migration Success Rate': '100% verified schema & data integrity'
                    },
                    history: [
                        'Deconstructed compiled Java-based Talend workflows and mapped extraction logic to scalable PySpark DataFrames.',
                        'Eliminated expensive legacy Talend server license overheads by shifting to serverless Databricks runtime.',
                        'Reduced data load cycle times by 45% using Spark parallel partition processing.'
                    ]
                },
                {
                    id: 'auto_loader',
                    name: 'Raw_Ingest_AutoLoader',
                    type: 'notebook',
                    x: 290, y: 150,
                    subtitle: 'Databricks Notebook',
                    desc: 'Autoloader structure mapping. Streams and ingests incoming files automatically with schema evolution on ADLS Gen2.',
                    settings: {
                        'Notebook Path': '/Production/Ingest/AutoLoader',
                        'Trigger Type': 'Structured Streaming',
                        'Storage Path': 'abfss://raw-data@pfizerstore.dfs.core.windows.net/',
                        'File Format': 'JSON/CSV Auto-detect'
                    },
                    history: [
                        'Structured Streaming using Databricks Auto Loader.',
                        'Managed dynamic schema evolution across variable CSV formats.',
                        'Ingested clinical logs into Bronze tables in real-time.'
                    ]
                },
                {
                    id: 'transform_spark',
                    name: 'Bronze_to_Silver_Spark',
                    type: 'notebook',
                    x: 520, y: 150,
                    subtitle: 'Databricks Notebook',
                    desc: 'PySpark data transformation task. Cleanses clinical columns, standardizes datatypes, validates integrity, and partitions tables.',
                    settings: {
                        'Notebook Path': '/Production/Transform/Bronze_to_Silver',
                        'Spark Clusters': 'Multi-node Autoscaling',
                        'Target Table Format': 'Delta Lake Silver Layer',
                        'Partition Key': 'Study_ID'
                    },
                    history: [
                        'Executed complex business rule transformations in PySpark.',
                        'Deduplicated clinical trial entries across 12 source hospitals.',
                        'Enforced rigorous schema validation rules.'
                    ]
                },
                {
                    id: 'merge_cdc',
                    name: 'Silver_to_Gold_Streaming',
                    type: 'notebook',
                    x: 750, y: 150,
                    subtitle: 'Databricks Notebook',
                    desc: 'Applies MERGE/CDC patterns. Performs incremental processing, updates dimensional profiles, and aggregates clinical trial indicators.',
                    settings: {
                        'Notebook Path': '/Production/Enrich/Silver_to_Gold',
                        'CDC Pattern': 'MERGE (Upsert)',
                        'Checkpoint Path': 'dbfs:/checkpoints/silver-to-gold-cdc',
                        'Aggregation Level': 'Patient & Trial Stage'
                    },
                    history: [
                        'Developed incremental processing stream utilizing Delta checkpoints.',
                        'Designed robust MERGE/CDC upsert queries.',
                        'Decreased compute resource requirements by 60% compared to full-reload patterns.'
                    ]
                },
                {
                    id: 'unity_cat',
                    name: 'Apply_Unity_Catalog',
                    type: 'governance',
                    x: 980, y: 70,
                    subtitle: 'Governance Control',
                    desc: 'Implements Databricks Unity Catalog security policies. Configures row-level controls and column masking on HIPAA medical columns.',
                    settings: {
                        'Catalog Instance': 'pfizer_clinical_trial_catalog',
                        'Security Standard': 'HIPAA Compliance',
                        'Row-Level Policies': 'Based on researcher role',
                        'Column Masking': 'SSN, Patient_Name, Phone'
                    },
                    history: [
                        'Enforced secure environment isolation (Sandbox, UAT, Prod).',
                        'Configured Column-level masking for patient identifiers.',
                        'Implemented RBAC security filters across datasets.'
                    ]
                },
                {
                    id: 'deploy_dab',
                    name: 'Deploy_CI_CD_DAB',
                    type: 'ci-cd',
                    x: 980, y: 230,
                    subtitle: 'GitHub Action Webhook',
                    desc: 'Validates notebook deployments using Databricks Asset Bundles (DAB) and triggers release pipelines with approval gates.',
                    settings: {
                        'Repository': 'github.com/Geolson/pfizer-clinical-pipelines',
                        'Deployment Mechanism': 'Databricks Asset Bundles (DAB)',
                        'Automation Engine': 'GitHub Actions',
                        'Release Approver': 'Lead Data Architect'
                    },
                    history: [
                        'Automated end-to-end cloud resource provisioning using DAB.',
                        'Designed approval-based release gates for staging-to-prod migrations.',
                        'Maintained 100% configuration-as-code consistency.'
                    ]
                }
            ],
            connections: [
                { from: 'talend_mig', to: 'auto_loader', status: 'success' },
                { from: 'auto_loader', to: 'transform_spark', status: 'success' },
                { from: 'transform_spark', to: 'merge_cdc', status: 'success' },
                { from: 'merge_cdc', to: 'unity_cat', status: 'success' },
                { from: 'merge_cdc', to: 'deploy_dab', status: 'success' }
            ]
        },
        hrblock: {
            id: 'hrblock',
            name: 'HRBlock_SSIS_Migration',
            description: 'Legacy SSIS modernization and production support. Successfully migrated 144 complex SSIS pipelines to ADF, managed automated deployments, and supported live systems with 99.9% uptime.',
            parameters: [
                { name: 'Environment', type: 'String', value: 'Production' },
                { name: 'SSIS_Pipelines_Migrated', type: 'Int32', value: 144 },
                { name: 'SSISDBConnectionString', type: 'String', value: 'Server=tcp:ssissource...' },
                { name: 'TotalReportCount', type: 'Int32', value: 65 }
            ],
            activities: [
                {
                    id: 'ssis_mig',
                    name: 'SSIS_Packages_Migration',
                    type: 'web',
                    x: 60, y: 150,
                    subtitle: 'Execute SSIS Package',
                    desc: 'Migration of 144 complex legacy SSIS pipelines over to Azure Data Factory (ADF) and PySpark structures.',
                    settings: {
                        'Migration Source': 'SQL Server Integration Services (SSIS)',
                        'Target Engine': 'Azure Data Factory (ADF)',
                        'Conversion Analyzer': 'ADF SSIS Migration Tool',
                        'SSIS Pipelines Migrated': '144 complex packages'
                    },
                    history: [
                        'Analyzed and successfully migrated 144 legacy SSIS packages.',
                        'Remodeled Control Flow and Data Flow constraints into native ADF pipelines.',
                        'Eliminated on-prem VM and SSISDB license and runtime overhead.'
                    ]
                },
                {
                    id: 'logic_apps',
                    name: 'ADF_LogicApps_Ingest',
                    type: 'function',
                    x: 290, y: 150,
                    subtitle: 'Azure Logic App / Function',
                    desc: 'Deploys and registers the 144 migrated pipelines. Automates resource orchestration, API schedules, and webhook notification triggers.',
                    settings: {
                        'Orchestration Target': 'LogicApps: Trigger_Loaders',
                        'Compute Model': 'Serverless Azure Functions (Python)',
                        'API Endpoint': 'https://api.hrblock.com/trigger',
                        'Operational Cost Reduction': '30% savings achieved'
                    },
                    history: [
                        'Orchestrated automated deployments of 144 migrated workflows.',
                        'Designed serverless Logic App REST integration endpoints.',
                        'Ensured 100% parameterization of connection strings.'
                    ]
                },
                {
                    id: 'sql_azure_copy',
                    name: 'OnPrem_SQL_to_Azure',
                    type: 'copy',
                    x: 520, y: 60,
                    subtitle: 'Copy Data Activity',
                    desc: 'Transfers relational tables from local Microsoft SQL databases to secure Azure SQL Database instances using Self-Hosted Runtimes.',
                    settings: {
                        'Source DB': 'SQL Server (On-Premise)',
                        'Destination DB': 'Azure SQL Database (PaaS)',
                        'Integration Runtime': 'Self-Hosted IR (sh-ir-hrblock)',
                        'Bulk Copy Settings': 'Enabled (Table Partitions)'
                    },
                    history: [
                        'Migrated 400GB+ of local transactional schemas.',
                        'Implemented stored procedure speed optimizations achieving 20% speedup.',
                        'Enforced TLS 1.2 secure encryption protocols during data transfer.'
                    ]
                },
                {
                    id: 'terraform_infra',
                    name: 'Terraform_Infrastructure',
                    type: 'ci-cd',
                    x: 520, y: 240,
                    subtitle: 'Terraform Plan / Apply',
                    desc: 'Builds target cloud environments. Automates virtual networks, firewalls, and SQL DB resource configurations.',
                    settings: {
                        'IaC Language': 'Terraform (HCL)',
                        'Provider': 'HashiCorp AzureRM v3.9',
                        'State Storage': 'Azure Blob Storage (Encrypted)',
                        'Workspace Mode': 'Multi-environment workspace'
                    },
                    history: [
                        'Scripted cloud infrastructure setups, eliminating manual human provisioning errors.',
                        'Deployed firewalls, virtual endpoints, and storage systems.',
                        'Automated resource deployment inside client CI/CD build scripts.'
                    ]
                },
                {
                    id: 'pbi_deploy',
                    name: 'PowerBI_Deploy',
                    type: 'web',
                    x: 750, y: 150,
                    subtitle: 'Web Activity (Power BI API)',
                    desc: 'Publishes 65+ analytical layouts to Azure Power BI Service and coordinates refresh intervals across transactional databases.',
                    settings: {
                        'Reports Migrated': '65+ layout reports',
                        'Server Type': 'Power BI Report Server -> Azure Cloud',
                        'Gateways Setup': 'On-Prem gateway configurations',
                        'Accessibility Improvement': '40% boost for remote analysts'
                    },
                    history: [
                        'Migrated reports from local servers to Azure Service cloud spaces.',
                        'Configured scheduled semantic refreshes for client reports.',
                        'Deployed dashboard designs accessed by 500+ corporate managers.'
                    ]
                },
                {
                    id: 'verify_uptime',
                    name: 'Verify_Uptime_And_Costs',
                    type: 'copy',
                    x: 980, y: 150,
                    subtitle: 'Copy Data / Monitor Control',
                    desc: 'Checks validation databases, logs operational metrics, and provides dedicated production support for the 144 deployed pipelines.',
                    settings: {
                        'Uptime Performance': '99.9% continuous uptime',
                        'Compute Costs Saving': '60% cost reduction on databases',
                        'Pipelines Supported': '144 active production pipelines',
                        'Reports Managed': '65 active analytical reports'
                    },
                    history: [
                        'Provided production support for all 144 migrated and deployed pipelines.',
                        'Maintained a verified 99.9% continuous runtime uptime.',
                        'Optimized database queries and indexing, achieving 60% compute cost savings.'
                    ]
                }
            ],
            connections: [
                { from: 'ssis_mig', to: 'logic_apps', status: 'success' },
                { from: 'logic_apps', to: 'sql_azure_copy', status: 'success' },
                { from: 'logic_apps', to: 'terraform_infra', status: 'success' },
                { from: 'sql_azure_copy', to: 'pbi_deploy', status: 'success' },
                { from: 'terraform_infra', to: 'pbi_deploy', status: 'success' },
                { from: 'pbi_deploy', to: 'verify_uptime', status: 'success' }
            ]
        }
    },
    
    // Datasets lookup
    datasets: [
        { name: 'ds_Talend_API', type: 'REST API Connection', details: 'Talend clinical REST endpoint' },
        { name: 'ds_ADLS_Gen2_Delta', type: 'Azure Data Lake Storage Gen2', details: 'Delta tables raw layer storage' },
        { name: 'ds_SQL_OnPrem', type: 'SQL Server Database', details: 'Local transactional database' },
        { name: 'ds_PowerBI_Metadata', type: 'JSON Config File', details: 'Analytical report specifications' }
    ],

    // Linked Services lookup
    linkedServices: [
        { name: 'ls_AzureDatabricks', type: 'Azure Databricks', description: 'Infosys/Pfizer Spark compute environment', status: 'Connected' },
        { name: 'ls_ADLS_Gen2', type: 'Azure Data Lake Gen2', description: 'Raw/Processed Delta lake directory structure', status: 'Connected' },
        { name: 'ls_GitHub_Actions', type: 'GitHub Actions Server', description: 'CI/CD pipeline webhook target', status: 'Connected' },
        { name: 'ls_AzureKeyVault', type: 'Azure Key Vault', description: 'Credential manager holding certificates', status: 'Connected' }
    ],

    // Triggers lookup
    triggers: [
        { name: 'tr_DailySchedule', type: 'Schedule Trigger', details: 'Triggers daily batch at 02:00 UTC' },
        { name: 'tr_StructuredStreaming', type: 'Event Trigger', details: 'Structured streaming listener check' }
    ]
};

// Monitor run logs mock list
let monitorRunsList = [
    { id: 'run-9f28a38c', name: 'Pfizer_ClinicalData_Ingest', start: '2026-06-22 10:15:32', duration: '42m 12s', trigger: 'Scheduled', status: 'Succeeded' },
    { id: 'run-2c8b74ea', name: 'HRBlock_SSIS_Migration', start: '2026-06-21 02:00:15', duration: '2h 15m 03s', trigger: 'Scheduled', status: 'Succeeded' },
    { id: 'run-7a5d3e09', name: 'Pfizer_ClinicalData_Ingest', start: '2026-06-21 10:15:01', duration: '41m 45s', trigger: 'Scheduled', status: 'Succeeded' },
    { id: 'run-8f32a76b', name: 'HRBlock_SSIS_Migration', start: '2026-06-20 02:00:08', duration: '2h 18m 10s', trigger: 'Scheduled', status: 'Succeeded' }
];

// Current state variables
let activePipelineId = 'pfizer';
let selectedActivityId = null;
let currentZoom = 1.0;
let isPanning = false;
let startPanX, startPanY;
let canvasOffsetX = 0, canvasOffsetY = 0;

// Global Card Drag State variables
let draggedCard = null;
let cardStartX = 0, cardStartY = 0;
let dragStartX = 0, dragStartY = 0;
let cardHasMoved = false;


/* ==========================================================================
   VIEW ORCHESTRATION & NAVIGATION
   ========================================================================== */

const viewPanels = document.querySelectorAll('.view-panel');
const navTabs = document.querySelectorAll('.nav-tab');

// Switch sidebar panel navigation tabs
function switchToTab(targetViewId) {
    const tab = document.querySelector(`.nav-tab[data-target="${targetViewId}"]`);
    if (!tab) return;

    // Update nav-tab CSS states
    navTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Hide/Show target sections
    viewPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === targetViewId) {
            panel.classList.add('active');
        }
    });
    
    // Redraw connections SVG if switching to author view
    if (targetViewId === 'author-view') {
        setTimeout(() => {
            drawPipelineConnections();
        }, 50);
    }
}

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetViewId = tab.getAttribute('data-target');
        switchToTab(targetViewId);
    });
});

// Accordion toggle in resource explorer
function toggleFolder(headerElement) {
    const folder = headerElement.parentElement;
    const contents = folder.querySelector('.folder-contents');
    const chevron = folder.querySelector('.chevron');
    
    if (folder.classList.contains('active')) {
        folder.classList.remove('active');
        contents.style.display = 'none';
        chevron.textContent = '▲';
    } else {
        folder.classList.add('active');
        contents.style.display = 'block';
        chevron.textContent = '▼';
    }
}

// Collapsible resource explorer
const leftSidebar = document.getElementById('left-sidebar');
const mainLayout = document.getElementById('main-layout');
const collapseSidebarBtn = document.getElementById('collapse-sidebar-btn');

collapseSidebarBtn.addEventListener('click', () => {
    leftSidebar.classList.toggle('collapsed-explorer');
    mainLayout.classList.toggle('collapsed-explorer');
    // Redraw SVG after size changes
    setTimeout(() => {
        drawPipelineConnections();
    }, 300);
});

// Mobile resource explorer slide in overlay
const menuBtn = document.getElementById('mobile-menu-btn');
if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const authorLayout = document.getElementById('author-layout');
        if (authorLayout) {
            authorLayout.classList.toggle('mobile-explorer-open');
        }
    });
}

// Close explorer when clicking layout content
document.addEventListener('click', () => {
    const authorLayout = document.getElementById('author-layout');
    if (authorLayout) {
        authorLayout.classList.remove('mobile-explorer-open');
    }
});

const resourceExplorer = document.getElementById('resource-explorer');
if (resourceExplorer) {
    resourceExplorer.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid closing explorer
    });
}


/* ==========================================================================
   DYNAMIC RESOURCE LIST LOADERS
   ========================================================================== */

function populateResourceExplorer() {
    // Datasets
    const datasetsList = document.getElementById('datasets-contents');
    datasetsList.innerHTML = '';
    portfolioData.datasets.forEach(ds => {
        datasetsList.innerHTML += `
            <div class="tree-item" onclick="showExplorerItemDetails('${ds.name}', 'dataset')">
                <span class="item-icon-other">📁</span>
                <span class="item-name">${ds.name}</span>
            </div>
        `;
    });

    // Linked Services
    const lsList = document.getElementById('linkedservices-contents');
    lsList.innerHTML = '';
    portfolioData.linkedServices.forEach(ls => {
        lsList.innerHTML += `
            <div class="tree-item" onclick="showExplorerItemDetails('${ls.name}', 'linked')">
                <span class="item-icon-other">🔗</span>
                <span class="item-name">${ls.name}</span>
            </div>
        `;
    });

    // Triggers
    const trList = document.getElementById('triggers-contents');
    trList.innerHTML = '';
    portfolioData.triggers.forEach(tr => {
        trList.innerHTML += `
            <div class="tree-item" onclick="showExplorerItemDetails('${tr.name}', 'trigger')">
                <span class="item-icon-other">⏰</span>
                <span class="item-name">${tr.name}</span>
            </div>
        `;
    });
    
    // Populate Linked Services manage tab table
    const linkedServicesTbody = document.getElementById('linked-services-tbody');
    linkedServicesTbody.innerHTML = '';
    portfolioData.linkedServices.forEach(ls => {
        linkedServicesTbody.innerHTML += `
            <tr>
                <td><strong><code>${ls.name}</code></strong></td>
                <td>${ls.type}</td>
                <td>${ls.description}</td>
                <td><span class="status-badge succeeded">${ls.status}</span></td>
            </tr>
        `;
    });
}

// Show explorer item details in properties bottom panel
function showExplorerItemDetails(itemName, itemType) {
    expandPropertiesPane();
    switchPropertiesTab('general');
    
    const container = document.getElementById('properties-view-container');
    let itemData;
    
    if (itemType === 'dataset') {
        itemData = portfolioData.datasets.find(d => d.name === itemName);
        container.innerHTML = `
            <div class="properties-grid">
                <div class="prop-label">Dataset Name</div>
                <div class="prop-val"><strong>${itemData.name}</strong></div>
                <div class="prop-label">Connector Type</div>
                <div class="prop-val">${itemData.type}</div>
                <div class="prop-label">Details</div>
                <div class="prop-val">${itemData.details}</div>
                <div class="prop-label">Reference Link</div>
                <div class="prop-val"><input type="text" class="prop-input-read" readonly value="https://learn.microsoft.com/en-us/azure/data-factory/concepts-datasets-linked-services"></div>
            </div>
        `;
    } else if (itemType === 'linked') {
        itemData = portfolioData.linkedServices.find(l => l.name === itemName);
        container.innerHTML = `
            <div class="properties-grid">
                <div class="prop-label">Service Name</div>
                <div class="prop-val"><strong>${itemData.name}</strong></div>
                <div class="prop-label">Connection Type</div>
                <div class="prop-val">${itemData.type}</div>
                <div class="prop-label">Purpose</div>
                <div class="prop-val">${itemData.description}</div>
                <div class="prop-label">Secure State</div>
                <div class="prop-val"><span class="status-badge succeeded">Encryption Active</span></div>
            </div>
        `;
    } else if (itemType === 'trigger') {
        itemData = portfolioData.triggers.find(t => t.name === itemName);
        container.innerHTML = `
            <div class="properties-grid">
                <div class="prop-label">Trigger Name</div>
                <div class="prop-val"><strong>${itemData.name}</strong></div>
                <div class="prop-label">Trigger Type</div>
                <div class="prop-val">${itemData.type}</div>
                <div class="prop-label">Schedule Detail</div>
                <div class="prop-val">${itemData.details}</div>
                <div class="prop-label">Status</div>
                <div class="prop-val"><span class="status-badge succeeded">Activated (Running)</span></div>
            </div>
        `;
    }
}

populateResourceExplorer();


/* ==========================================================================
   PIPELINE CANVAS ORCHESTRATION
   ========================================================================== */

const activitiesContainer = document.getElementById('activities-container');
const connectionsSvg = document.getElementById('connections-svg');
const pipelineCanvasContainer = document.getElementById('pipeline-canvas-container');

// Select active pipeline tab explorer trigger
function selectPipeline(pipelineId) {
    activePipelineId = pipelineId;
    selectedActivityId = null;
    
    // Ensure the tab element is visible (revert display: none from closeTab)
    const tabEl = document.getElementById(`tab-${pipelineId}`);
    if (tabEl) {
        tabEl.style.display = '';
    }
    
    // Update active tab styles
    document.querySelectorAll('.canvas-tab').forEach(tab => tab.classList.remove('active'));
    if (tabEl) {
        tabEl.classList.add('active');
    }
    
    // Update explorer tree list highlight styles
    document.querySelectorAll('.tree-item').forEach(item => item.classList.remove('active'));
    const treeItem = document.getElementById(`tree-${pipelineId}`);
    if (treeItem) {
        treeItem.classList.add('active');
    }
    
    // Show canvas workspace elements and hide empty state
    const ribbon = document.getElementById('canvas-ribbon');
    const container = document.getElementById('pipeline-canvas-container');
    const pane = document.getElementById('properties-pane');
    const emptyState = document.getElementById('canvas-empty-state');
    
    if (ribbon) ribbon.style.display = '';
    if (container) container.style.display = '';
    if (pane) pane.style.display = '';
    if (emptyState) emptyState.style.display = 'none';
    
    // Load activities & reset panning zoom
    resetZoom();
    loadPipelineActivities(pipelineId);
    
    // Load default pipeline general settings in properties panel
    loadPipelineProperties(pipelineId);
}

// Load activity cards onto the canvas UI
function loadPipelineActivities(pipelineId) {
    activitiesContainer.innerHTML = '';
    const pipeline = portfolioData.pipelines[pipelineId];
    
    pipeline.activities.forEach(act => {
        // Icon determinations
        let icon = '⚡';
        let typeClass = 'act-type-copy';
        
        if (act.type === 'copy') { icon = '⇅'; typeClass = 'act-type-copy'; }
        else if (act.type === 'notebook') { icon = '📓'; typeClass = 'act-type-notebook'; }
        else if (act.type === 'function') { icon = 'ƒ'; typeClass = 'act-type-function'; }
        else if (act.type === 'governance') { icon = '🛡'; typeClass = 'act-type-governance'; }
        else if (act.type === 'web') { icon = '🌐'; typeClass = 'act-type-web'; }
        else if (act.type === 'ci-cd') { icon = '⚙'; typeClass = 'act-type-ci-cd'; }
        
        activitiesContainer.innerHTML += `
            <div class="activity-card ${typeClass}" id="node-${act.id}" style="left:${act.x}px; top:${act.y}px;" onclick="selectActivity('${act.id}', event)">
                <div class="activity-icon-wrapper">
                    <span class="activity-icon">${icon}</span>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${act.name}</div>
                    <div class="activity-subtitle">${act.subtitle}</div>
                </div>
                <div class="activity-status-dot" id="status-${act.id}"></div>
                <button class="activity-run-btn" title="Run Step" onclick="runSingleStepSim('${act.id}', event)">▶</button>
            </div>
        `;
    });

    drawPipelineConnections();
    enableActivityDrag();
}

// Enable drag-to-move for activity cards on canvas
function enableActivityDrag() {
    const cards = document.querySelectorAll('.activity-card');
    
    cards.forEach(card => {
        // Mouse drag start
        card.addEventListener('mousedown', (e) => {
            if (e.target.closest('.activity-run-btn')) return;
            startCardDrag(card, e.clientX, e.clientY, e);
        });
        
        // Touch drag start
        card.addEventListener('touchstart', (e) => {
            if (e.target.closest('.activity-run-btn')) return;
            const touch = e.touches[0];
            startCardDrag(card, touch.clientX, touch.clientY, e);
        }, { passive: false });
        
        // Prevent click-selection when user was dragging
        card.addEventListener('click', (e) => {
            if (cardHasMoved && draggedCard === card) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true);
    });
}

function startCardDrag(card, clientX, clientY, e) {
    e.stopPropagation();
    draggedCard = card;
    cardHasMoved = false;
    cardStartX = parseInt(card.style.left) || 0;
    cardStartY = parseInt(card.style.top) || 0;
    dragStartX = clientX;
    dragStartY = clientY;
    card.style.zIndex = '10';
    card.style.transition = 'none';
}

// Select an activity and display its property fields
function selectActivity(activityId, event) {
    if (event) event.stopPropagation(); // Avoid triggering canvas reset
    
    selectedActivityId = activityId;
    
    // Visual node selections
    document.querySelectorAll('.activity-card').forEach(card => card.classList.remove('selected'));
    const card = document.getElementById(`node-${activityId}`);
    if (card) card.classList.add('selected');
    
    // Open property drawer
    expandPropertiesPane();
    
    // Load tabs data
    switchPropertiesTab('general');
}

// Reset activity node highlighting on background clicks
pipelineCanvasContainer.addEventListener('click', (e) => {
    if (e.target === pipelineCanvasContainer || e.target === connectionsSvg) {
        selectedActivityId = null;
        document.querySelectorAll('.activity-card').forEach(card => card.classList.remove('selected'));
        loadPipelineProperties(activePipelineId);
    }
});

// Load the general pipeline data if no activity selected
function loadPipelineProperties(pipelineId) {
    const pipeline = portfolioData.pipelines[pipelineId];
    switchPropertiesTab('general');
}

// Draw cubic curves between activities (ADF design style)
function drawPipelineConnections() {
    const pipeline = portfolioData.pipelines[activePipelineId];
    connectionsSvg.innerHTML = `
        <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="var(--text-muted)" />
            </marker>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#107c41" />
            </marker>
        </defs>
    `;

    pipeline.connections.forEach(conn => {
        const fromNode = document.getElementById(`node-${conn.from}`);
        const toNode = document.getElementById(`node-${conn.to}`);
        
        if (fromNode && toNode) {
            // Fetch layout locations
            const fromX = parseInt(fromNode.style.left) + fromNode.offsetWidth;
            const fromY = parseInt(fromNode.style.top) + 24;
            const toX = parseInt(toNode.style.left);
            const toY = parseInt(toNode.style.top) + 24;

            // Draw smooth horizontal bezier curve
            const controlOffset = Math.min(100, Math.abs(toX - fromX) * 0.5);
            const d = `M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${toX - controlOffset} ${toY}, ${toX} ${toY}`;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            
            // Check status for green colored arrows
            const statusDot = document.getElementById(`status-${conn.from}`);
            const isSucceeded = statusDot && statusDot.classList.contains('succeeded');
            
            path.setAttribute('stroke', isSucceeded ? '#107c41' : 'var(--text-muted)');
            path.setAttribute('stroke-width', isSucceeded ? '2' : '1.5');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', isSucceeded ? 'url(#arrow-green)' : 'url(#arrow)');
            
            connectionsSvg.appendChild(path);
        }
    });
}

// Close tab simulator
function closeTab(pipelineId, event) {
    if (event) event.stopPropagation();
    
    const tab = document.getElementById(`tab-${pipelineId}`);
    if (tab) {
        tab.style.display = 'none';
    }
    
    // Switch to another tab if closed active one
    if (activePipelineId === pipelineId) {
        const otherPipelineId = pipelineId === 'pfizer' ? 'hrblock' : 'pfizer';
        const otherTab = document.getElementById(`tab-${otherPipelineId}`);
        if (otherTab && otherTab.style.display !== 'none') {
            selectPipeline(otherPipelineId);
        } else {
            // Both tabs are closed! Close everything
            activePipelineId = null;
            selectedActivityId = null;
            
            // Remove explorer active styles
            document.querySelectorAll('.tree-item').forEach(item => item.classList.remove('active'));
            
            // Hide canvas workspace components and show empty state
            const ribbon = document.getElementById('canvas-ribbon');
            const container = document.getElementById('pipeline-canvas-container');
            const pane = document.getElementById('properties-pane');
            const emptyState = document.getElementById('canvas-empty-state');
            
            if (ribbon) ribbon.style.display = 'none';
            if (container) container.style.display = 'none';
            if (pane) pane.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
        }
    } else {
        // If we closed the inactive tab, check if the other is also closed
        const otherPipelineId = pipelineId === 'pfizer' ? 'hrblock' : 'pfizer';
        const otherTab = document.getElementById(`tab-${otherPipelineId}`);
        if (otherTab && otherTab.style.display === 'none') {
            // Both closed!
            activePipelineId = null;
            selectedActivityId = null;
            document.querySelectorAll('.tree-item').forEach(item => item.classList.remove('active'));
            
            const ribbon = document.getElementById('canvas-ribbon');
            const container = document.getElementById('pipeline-canvas-container');
            const pane = document.getElementById('properties-pane');
            const emptyState = document.getElementById('canvas-empty-state');
            
            if (ribbon) ribbon.style.display = 'none';
            if (container) container.style.display = 'none';
            if (pane) pane.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
        }
    }
}


/* ==========================================================================
   PROPERTIES PANE CONTROLS
   ========================================================================== */

const propertiesPane = document.getElementById('properties-pane');
const propCollapseArrow = document.getElementById('prop-collapse-arrow');

function togglePropertiesPane() {
    propertiesPane.classList.toggle('collapsed');
    if (propertiesPane.classList.contains('collapsed')) {
        propCollapseArrow.textContent = '▲';
    } else {
        propCollapseArrow.textContent = '▼';
    }
    // Redraw SVG after pane height adjustments
    setTimeout(() => {
        drawPipelineConnections();
    }, 300);
}

function expandPropertiesPane() {
    propertiesPane.classList.remove('collapsed');
    propCollapseArrow.textContent = '▼';
    setTimeout(() => {
        drawPipelineConnections();
    }, 300);
}

// Swapping properties bottom sub-tabs
let activePropertiesTab = 'general';

function switchPropertiesTab(tabId) {
    activePropertiesTab = tabId;
    
    // Style highlights
    document.querySelectorAll('.prop-tab').forEach(t => t.classList.remove('active'));
    const btn = Array.from(document.querySelectorAll('.prop-tab')).find(b => b.textContent.toLowerCase() === (tabId === 'runhistory' ? 'run logs' : tabId));
    if (btn) btn.classList.add('active');

    // Update settings tab label dynamically based on activity
    const settingsTab = document.getElementById('prop-settings-tab');
    if (selectedActivityId) {
        const activity = portfolioData.pipelines[activePipelineId].activities.find(a => a.id === selectedActivityId);
        if (activity.type === 'copy') {
            settingsTab.textContent = 'Source / Sink';
        } else {
            settingsTab.textContent = 'Settings';
        }
    } else {
        settingsTab.textContent = 'Settings';
    }

    renderPropertiesContent();
}

function renderPropertiesContent() {
    const container = document.getElementById('properties-view-container');
    container.innerHTML = '';
    
    const pipeline = portfolioData.pipelines[activePipelineId];
    
    if (selectedActivityId) {
        // Render content for SELECTED ACTIVITY
        const activity = pipeline.activities.find(a => a.id === selectedActivityId);
        
        if (activePropertiesTab === 'general') {
            container.innerHTML = `
                <div class="properties-grid">
                    <div class="prop-label">Activity Name</div>
                    <div class="prop-val"><strong>${activity.name}</strong></div>
                    <div class="prop-label">Activity Description</div>
                    <div class="prop-val">${activity.desc}</div>
                    <div class="prop-label">Compute Engine</div>
                    <div class="prop-val"><code>${activity.subtitle}</code></div>
                </div>
            `;
        } else if (activePropertiesTab === 'settings') {
            let settingsRows = '';
            for (const [key, val] of Object.entries(activity.settings)) {
                settingsRows += `
                    <div class="prop-label">${key}</div>
                    <div class="prop-val"><input type="text" class="prop-input-read" readonly value="${val}"></div>
                `;
            }
            container.innerHTML = `<div class="properties-grid">${settingsRows}</div>`;
        } else if (activePropertiesTab === 'parameters') {
            container.innerHTML = `
                <div class="properties-grid">
                    <div class="prop-label">Parameter Keys</div>
                    <div class="prop-val">No parameters configured. Values are inherited from pipeline scope variables.</div>
                </div>
            `;
        } else if (activePropertiesTab === 'runhistory') {
            let historyLines = '';
            activity.history.forEach(line => {
                historyLines += `<div class="log-line"><span class="log-time">[SUCCESS]</span> ${line}</div>`;
            });
            container.innerHTML = `
                <div class="log-viewer">
                    <div class="log-line"><span class="log-time">[SYSTEM]</span> Reading run metrics for target step: ${activity.name}</div>
                    ${historyLines}
                    <div class="log-line log-success"><span class="log-time">[SUCCESS]</span> Validation Check Passed.</div>
                </div>
            `;
        }
    } else {
        // Render content for OVERALL PIPELINE (No activity selected)
        if (activePropertiesTab === 'general') {
            container.innerHTML = `
                <div class="properties-grid">
                    <div class="prop-label">Pipeline Name</div>
                    <div class="prop-val"><strong>${pipeline.name}</strong></div>
                    <div class="prop-label">Description</div>
                    <div class="prop-val">${pipeline.description}</div>
                    <div class="prop-label">Integration Runtime</div>
                    <div class="prop-val"><code>AutoResolveIntegrationRuntime (Public cloud)</code></div>
                </div>
            `;
        } else if (activePropertiesTab === 'settings') {
            container.innerHTML = `
                <div class="properties-grid">
                    <div class="prop-label">Concurrency</div>
                    <div class="prop-val">Inherited</div>
                    <div class="prop-label">Logging Policy</div>
                    <div class="prop-val">Log activity executions on complete.</div>
                </div>
            `;
        } else if (activePropertiesTab === 'parameters') {
            let paramRows = '';
            pipeline.parameters.forEach(p => {
                paramRows += `
                    <div class="prop-label">${p.name}</div>
                    <div class="prop-val"><input type="text" class="prop-input-read" readonly value="${p.value} (${p.type})"></div>
                `;
            });
            container.innerHTML = `<div class="properties-grid">${paramRows}</div>`;
        } else if (activePropertiesTab === 'runhistory') {
            container.innerHTML = `
                <div class="log-viewer">
                    <div class="log-line"><span class="log-time">[INFO]</span> Select any pipeline activity node to view specific processing step output logs.</div>
                    <div class="log-line"><span class="log-time">[INFO]</span> Trigger 'Debug Run' to test this pipeline pipeline.</div>
                </div>
            `;
        }
    }
}


/* ==========================================================================
   ZOOM AND PAN CONTROL LOGIC
   ========================================================================== */

function zoomCanvas(amount) {
    currentZoom = Math.min(Math.max(0.5, currentZoom + amount), 1.5);
    applyCanvasTransform();
}

function resetZoom() {
    currentZoom = 1.0;
    canvasOffsetX = 0;
    canvasOffsetY = 0;
    applyCanvasTransform();
}

function applyCanvasTransform() {
    activitiesContainer.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${currentZoom})`;
    connectionsSvg.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${currentZoom})`;
}

// Canvas Panning click-and-drag grid
pipelineCanvasContainer.addEventListener('mousedown', (e) => {
    if (e.target === pipelineCanvasContainer || e.target === connectionsSvg || e.target === activitiesContainer) {
        isPanning = true;
        startPanX = e.clientX - canvasOffsetX;
        startPanY = e.clientY - canvasOffsetY;
        pipelineCanvasContainer.style.cursor = 'grabbing';
    }
});

window.addEventListener('mousemove', (e) => {
    if (isPanning) {
        canvasOffsetX = e.clientX - startPanX;
        canvasOffsetY = e.clientY - startPanY;
        applyCanvasTransform();
    } else if (draggedCard) {
        const dx = (e.clientX - dragStartX) / currentZoom;
        const dy = (e.clientY - dragStartY) / currentZoom;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            cardHasMoved = true;
        }
        draggedCard.style.left = (cardStartX + dx) + 'px';
        draggedCard.style.top = (cardStartY + dy) + 'px';
        drawPipelineConnections();
    }
});

window.addEventListener('mouseup', () => {
    if (isPanning) {
        isPanning = false;
        pipelineCanvasContainer.style.cursor = 'default';
    }
    if (draggedCard) {
        draggedCard.style.zIndex = '';
        draggedCard.style.transition = '';
        
        if (cardHasMoved) {
            const actId = draggedCard.id.replace('node-', '');
            const pipeline = portfolioData.pipelines[activePipelineId];
            const act = pipeline.activities.find(a => a.id === actId);
            if (act) {
                act.x = parseInt(draggedCard.style.left);
                act.y = parseInt(draggedCard.style.top);
            }
            drawPipelineConnections();
        }
        draggedCard = null;
    }
});

// Touch support for canvas panning on mobile/tablets
pipelineCanvasContainer.addEventListener('touchstart', (e) => {
    if (e.target === pipelineCanvasContainer || e.target === connectionsSvg || e.target === activitiesContainer) {
        isPanning = true;
        const touch = e.touches[0];
        startPanX = touch.clientX - canvasOffsetX;
        startPanY = touch.clientY - canvasOffsetY;
    }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    if (isPanning) {
        e.preventDefault();
        const touch = e.touches[0];
        canvasOffsetX = touch.clientX - startPanX;
        canvasOffsetY = touch.clientY - startPanY;
        applyCanvasTransform();
    } else if (draggedCard) {
        e.preventDefault();
        const touch = e.touches[0];
        const dx = (touch.clientX - dragStartX) / currentZoom;
        const dy = (touch.clientY - dragStartY) / currentZoom;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            cardHasMoved = true;
        }
        draggedCard.style.left = (cardStartX + dx) + 'px';
        draggedCard.style.top = (cardStartY + dy) + 'px';
        drawPipelineConnections();
    }
}, { passive: false });

window.addEventListener('touchend', () => {
    if (isPanning) {
        isPanning = false;
    }
    if (draggedCard) {
        draggedCard.style.zIndex = '';
        draggedCard.style.transition = '';
        
        if (cardHasMoved) {
            const actId = draggedCard.id.replace('node-', '');
            const pipeline = portfolioData.pipelines[activePipelineId];
            const act = pipeline.activities.find(a => a.id === actId);
            if (act) {
                act.x = parseInt(draggedCard.style.left);
                act.y = parseInt(draggedCard.style.top);
            }
            drawPipelineConnections();
        }
        draggedCard = null;
    }
});

// Cancel handling
window.addEventListener('touchcancel', () => {
    isPanning = false;
    if (draggedCard) {
        draggedCard.style.zIndex = '';
        draggedCard.style.transition = '';
        draggedCard = null;
    }
});

// Pinch-to-zoom on canvas (prevent native zoom and apply custom canvas zoom)
let lastPinchDist = 0;
pipelineCanvasContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        isPanning = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist = Math.sqrt(dx * dx + dy * dy);
        e.preventDefault(); // Stop native browser pinch gesture
    }
}, { passive: false });

pipelineCanvasContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault(); // Stop native browser pinch zoom and page pan
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = dist - lastPinchDist;
        if (Math.abs(delta) > 3) { // High response threshold
            zoomCanvas(delta > 0 ? 0.04 : -0.04);
            lastPinchDist = dist;
        }
    }
}, { passive: false });


/* ==========================================================================
   PIPELINE DEBUG RUN SIMULATOR
   ========================================================================== */

let isRunningPipeline = false;
let pipelineLogTimeout = null;

function runPipelineDebug() {
    if (isRunningPipeline) return;
    isRunningPipeline = true;
    
    const pipeline = portfolioData.pipelines[activePipelineId];
    const logViewerContainer = document.getElementById('properties-view-container');
    
    // Switch to logs tab and reset nodes status visual states
    selectedActivityId = null; // Unselect single node
    switchPropertiesTab('runhistory');
    expandPropertiesPane();
    
    // Select activity cards and remove previous statuses
    pipeline.activities.forEach(act => {
        const dot = document.getElementById(`status-${act.id}`);
        if (dot) {
            dot.className = 'activity-status-dot';
            dot.style.display = 'none';
        }
    });
    
    drawPipelineConnections(); // Reset line colors
    
    // Setup initial system logs console printouts
    logViewerContainer.innerHTML = `
        <div class="log-viewer" id="pipeline-live-logs">
            <div class="log-line log-info"><span class="log-time">[${new Date().toLocaleTimeString()}]</span> Initiating debug run for workspace: adf-arul-geolson</div>
            <div class="log-line log-info"><span class="log-time">[${new Date().toLocaleTimeString()}]</span> Validating pipeline dependencies...</div>
        </div>
    `;
    
    const logsBox = document.getElementById('pipeline-live-logs');
    
    // Sequential scheduler simulator helper
    let currentStep = 0;
    
    function runNextStep() {
        if (currentStep >= pipeline.activities.length) {
            // Done pipeline success executions!
            isRunningPipeline = false;
            logsBox.innerHTML += `<div class="log-line log-success"><span class="log-time">[${new Date().toLocaleTimeString()}]</span> PIPELINE RUN COMPLETED SUCCESSFULLY.</div>`;
            logsBox.scrollTop = logsBox.scrollHeight;
            
            // Add run record into Monitor lists
            const newRunId = 'run-' + Math.random().toString(36).substring(2, 10);
            monitorRunsList.unshift({
                id: newRunId,
                name: pipeline.name,
                start: new Date().toISOString().replace('T', ' ').substring(0, 19),
                duration: activePipelineId === 'pfizer' ? '45s' : '55s',
                trigger: 'Manual (Debug)',
                status: 'Succeeded'
            });
            
            refreshMonitorLogs();
            drawPipelineConnections();
            return;
        }
        
        const activity = pipeline.activities[currentStep];
        
        // Show status running
        const dot = document.getElementById(`status-${activity.id}`);
        if (dot) {
            dot.className = 'activity-status-dot running';
            dot.style.display = 'block';
        }
        
        logsBox.innerHTML += `<div class="log-line"><span class="log-time">[${new Date().toLocaleTimeString()}]</span> Triggering activity: ${activity.name}...</div>`;
        logsBox.scrollTop = logsBox.scrollHeight;
        
        setTimeout(() => {
            // Mark step success completed
            if (dot) {
                dot.className = 'activity-status-dot succeeded';
            }
            
            // Log outcomes from resume
            activity.history.forEach(logLine => {
                logsBox.innerHTML += `<div class="log-line log-success"><span class="log-time">[SUCCESS]</span> &nbsp;↳ ${logLine}</div>`;
            });
            logsBox.scrollTop = logsBox.scrollHeight;
            
            // Draw connections to color success green
            drawPipelineConnections();
            
            currentStep++;
            runNextStep();
        }, 1200); // 1.2s delay for each step visual feel
    }
    
    setTimeout(() => {
        runNextStep();
    }, 800);
}

// Single step run button simulation
function runSingleStepSim(activityId, event) {
    event.stopPropagation(); // Prevent card select double click conflicts
    
    const dot = document.getElementById(`status-${activityId}`);
    if (dot) {
        dot.className = 'activity-status-dot running';
        dot.style.display = 'block';
    }
    
    setTimeout(() => {
        if (dot) {
            dot.className = 'activity-status-dot succeeded';
        }
        drawPipelineConnections();
        
        // Auto select node and open properties log history
        selectActivity(activityId);
        switchPropertiesTab('runhistory');
    }, 1000);
}


/* ==========================================================================
   MONITOR LOGS INVENTORY
   ========================================================================== */

const monitorRunsTbody = document.getElementById('monitor-runs-tbody');

function refreshMonitorLogs() {
    monitorRunsTbody.innerHTML = '';
    
    monitorRunsList.forEach(run => {
        monitorRunsTbody.innerHTML += `
            <tr>
                <td><strong>⚡ ${run.name}</strong></td>
                <td><code>${run.id}</code></td>
                <td>${run.start}</td>
                <td>${run.duration}</td>
                <td>${run.trigger}</td>
                <td><span class="status-badge succeeded">${run.status}</span></td>
                <td>
                    <button class="ribbon-btn" onclick="drilldownPipelineRun('${run.name}')">View Activity Runs</button>
                </td>
            </tr>
        `;
    });
}

function drilldownPipelineRun(pipelineName) {
    const drilldownSection = document.getElementById('activity-runs-drilldown');
    const drilldownTitle = document.getElementById('drilldown-pipeline-name');
    const activityTbody = document.getElementById('activity-runs-tbody');
    
    drilldownTitle.textContent = pipelineName;
    activityTbody.innerHTML = '';
    
    // Find matching pipeline data
    const pId = pipelineName.includes('Pfizer') ? 'pfizer' : 'hrblock';
    const pipeline = portfolioData.pipelines[pId];
    
    pipeline.activities.forEach(act => {
        // Output details
        let details = act.history[0];
        activityTbody.innerHTML += `
            <tr>
                <td><strong>${act.name}</strong></td>
                <td><code>${act.subtitle}</code></td>
                <td>${pId === 'pfizer' ? '8s' : '10s'}</td>
                <td>Auto-scale compute nodes</td>
                <td><span class="status-badge succeeded">Succeeded</span></td>
                <td>${details}</td>
            </tr>
        `;
    });
    
    drilldownSection.style.display = 'block';
    drilldownSection.scrollIntoView({ behavior: 'smooth' });
}

function hideDrilldown() {
    document.getElementById('activity-runs-drilldown').style.display = 'none';
}

refreshMonitorLogs();


/* ==========================================================================
   MANAGE SUBTAB SWITCHING
   ========================================================================== */

function switchManageSubTab(subTabId, element) {
    // Style active sidebar menu lists
    document.querySelectorAll('.manage-nav-list li').forEach(li => li.classList.remove('active'));
    element.classList.add('active');
    
    // Hide all sub panels
    document.querySelectorAll('.manage-subpanel').forEach(panel => panel.classList.remove('active'));
    
    // Show chosen panel
    document.getElementById(`manage-subpanel-${subTabId}`).classList.add('active');
}


/* ==========================================================================
   THEME SWITCHING LOGIC
   ========================================================================== */

const themeToggleBtn = document.getElementById('theme-toggle-btn');

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = 'dark';
    
    if (currentTheme === 'dark') {
        newTheme = 'light';
    }
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update particle colors
    initParticles();
});

// Load stored theme or default
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Load default canvas diagrams
selectPipeline('pfizer');

// Tap-to-toggle stat card details on touch devices (desktop gets inline hover; mobile gets modal popup)
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            // Show mobile modal popup
            const statNum = card.querySelector('.stat-num').textContent;
            const statLabel = card.querySelector('.stat-label').textContent;
            const detailTag = card.querySelector('.detail-tag').textContent;
            const desc = card.querySelector('.stat-hover-details p').textContent;
            
            const modal = document.getElementById('stat-modal');
            if (modal) {
                document.getElementById('modal-stat-num').textContent = statNum;
                document.getElementById('modal-stat-label').textContent = statLabel;
                document.getElementById('modal-detail-tag').textContent = detailTag;
                document.getElementById('modal-desc').textContent = desc;
                modal.style.display = 'flex';
            }
        } else {
            // Standard desktop hover toggle fallback
            document.querySelectorAll('.stat-card.tapped').forEach(c => {
                if (c !== card) c.classList.remove('tapped');
            });
            card.classList.toggle('tapped');
        }
    });
});

// Close stat modal event listeners
const statModal = document.getElementById('stat-modal');
if (statModal) {
    // Close on close button click
    const closeBtn = statModal.querySelector('.modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            statModal.style.display = 'none';
        });
    }
    // Close on clicking backdrop
    statModal.addEventListener('click', (e) => {
        if (e.target === statModal) {
            statModal.style.display = 'none';
        }
    });
}

// Other buttons actions alert
function validatePipeline() {
    alert("ADF Pipeline Validation Successful: 0 warnings, 0 errors found.");
}

function publishAll() {
    alert("Publishing changes to Azure repository branch (main). Live changes updated!");
}

/* ==========================================================================
   FUNCTIONAL SEARCH BAR
   ========================================================================== */

const searchInput = document.getElementById('header-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // 1. Filter resource explorer items
        const treeItems = document.querySelectorAll('.tree-item');
        treeItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = 'flex';
                if (query !== '') {
                    item.style.backgroundColor = 'var(--brand-azure-glow)';
                    // Auto-expand parent folder if matching items inside
                    const folder = item.closest('.tree-folder');
                    if (folder && !folder.classList.contains('active')) {
                        toggleFolder(folder.querySelector('.folder-title'));
                    }
                } else {
                    item.style.backgroundColor = '';
                }
            } else {
                item.style.display = 'none';
            }
        });
        
        // 2. Filter canvas activities for the active pipeline
        const activityCards = document.querySelectorAll('.activity-card');
        activityCards.forEach(card => {
            const title = card.querySelector('.activity-title').textContent.toLowerCase();
            const subtitle = card.querySelector('.activity-subtitle').textContent.toLowerCase();
            if (title.includes(query) || subtitle.includes(query)) {
                card.style.opacity = '1';
                if (query !== '') {
                    card.style.border = '2px solid #50e6ff';
                    card.style.boxShadow = '0 0 12px var(--brand-azure-glow)';
                } else {
                    card.style.border = '';
                    card.style.boxShadow = '';
                }
            } else {
                card.style.opacity = query !== '' ? '0.3' : '1';
                card.style.border = '';
                card.style.boxShadow = '';
            }
        });
    });
}
