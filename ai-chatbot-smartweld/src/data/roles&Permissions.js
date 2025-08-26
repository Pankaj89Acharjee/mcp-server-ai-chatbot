const rolesPermissions = {
    SUPERADMIN: {
        titles: ['Home', 'Jobs', 'Machines', 'Consumables', 'Organization', 'Analytics Report', 'Charts'],
        links: [
            'dashboard', 'jobList', 'machineJobMapping', 'machineJobTarget', 'jobConfig',
            'machineType', 'machineStatus', 'allMachine', 'machineHardwareMapping', 'downtime',
            'allUsers', 'shifts', 'location', 'site', 'line', 'realTime', 'powerBI',
            'lineChart', 'areaChart', 'barChart', 'pieChart', 'financialChart',
            'colourMappingChart', 'pyramidChart', 'stackedChart',
        ],
    },
    ADMINISTRATOR: {
        titles: ['Home', 'Jobs', 'Machines', 'Consumables', 'Organization', 'Analytics Report', 'Charts'],
        links: [
            'dashboard', 'jobList', 'machineJobMapping', 'machineJobTarget', 'jobConfig',
            'machineType', 'machineStatus', 'allMachine', 'machineHardwareMapping', 'downtime',
            'allUsers', 'shifts', 'location', 'site', 'line', 'realTime', 'powerBI',
            'lineChart', 'areaChart', 'barChart', 'pieChart', 'financialChart',
            'colourMappingChart', 'pyramidChart', 'stackedChart',
        ],
    },
    ADMIN: {
        titles: ['Home', 'Jobs', 'Machines', 'Organization'],
        links: [
            'dashboard', 'jobList', 'machineType', 'machineStatus', 'location', 'allUsers',
        ],
    },
    SUPERVISOR: {
        titles: ['Home', 'Jobs'],
        links: ['dashboard', 'jobList', 'machineJobMapping'],
    },
    OPERATOR: {
        titles: ['Home'],
        links: ['dashboard'],
    },
    ORGHEAD: {
        titles: ['Home', 'Organization'],
        links: ['dashboard', 'allUsers', 'shifts', 'site'],
    },
};

export default rolesPermissions;
