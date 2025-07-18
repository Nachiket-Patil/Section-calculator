// ============================== GLOBAL STATE ==============================
// ==========================================================================
let currentSectionType = null;
const sectionTitles = {
    'isection': 'I-Section Properties',
    'channel': 'Channel Section Properties',
    'angle': 'Angle Compound Section Properties'
};

// ============================================================================
// ============================== DOM REFERENCES ==============================
// ============================================================================

const cardsContainer = document.getElementById('cardsContainer');
const inputContainer = document.getElementById('inputContainer');
const outputContainer = document.getElementById('outputContainer');
const backButton = document.getElementById('backButton');
const sectionTitle = document.getElementById('sectionTitle');
const resetBtn = document.getElementById('resetBtn');
const calculateBtn = document.getElementById('calculateBtn');
const angleSpecificOptions = document.getElementById('angleSpecificOptions');

// Angle-specific elements
const centerPlateWidth = document.getElementById('centerPlateWidth');
const centerPlateThickness = document.getElementById('centerPlateThickness');
const topCategoryDropdown = document.getElementById('topCategoryDropdown');
const topDesignationDropdown = document.getElementById('topDesignationDropdown');
const topManualCheckbox = document.getElementById('topManualCheckbox');
const topManualInputs = document.getElementById('topManualInputs');
const differentAnglesCheckbox = document.getElementById('differentAnglesCheckbox');
const bottomAngleSection = document.getElementById('bottomAngleSection');
const bottomCategoryDropdown = document.getElementById('bottomCategoryDropdown');
const bottomDesignationDropdown = document.getElementById('bottomDesignationDropdown');
const bottomManualCheckbox = document.getElementById('bottomManualCheckbox');
const bottomManualInputs = document.getElementById('bottomManualInputs');

// Reinforcement elements
const webReinforcementCheckbox = document.getElementById('webReinforcementCheckbox');
const webReinforcementInputs = document.getElementById('webReinforcementInputs');
const flangeReinforcementCheckbox = document.getElementById('flangeReinforcementCheckbox');
const flangeReinforcementInputs = document.getElementById('flangeReinforcementInputs');

const standardSectionOptions = document.getElementById('standardSectionOptions');
const sectionCategoryDropdown = document.getElementById('sectionCategoryDropdown');
const sectionDesignationDropdown = document.getElementById('sectionDesignationDropdown');
const sectionManualCheckbox = document.getElementById('sectionManualCheckbox');
const sectionManualInputs = document.getElementById('sectionManualInputs');
const iSectionManual = document.getElementById('iSectionManual');
const channelManual = document.getElementById('channelManual');
const categoryNames = {
    'isectionmed': 'I-Beam (Medium Flange - ISMB)',
    'isectionjb': 'I-Beam (Junior - ISJB)',
    'isectionlwb': 'I-Beam (Light Weight - ISLB)',
    'isectionwb': 'I-Beam (Wide Flange - ISWB)',
    'isectionhb': 'I-Beam (Heavy - ISHB)',
    'channelmid': 'Channel (Medium - ISMC)',
    'channeljr': 'Channel (Junior - ISJC)',
    'channellw': 'Channel (Light Weight - ISLC)',
    'anglee': 'Equal Angles',
    'angleu': 'Unequal Angles'
};

// ============================================================================
// ============================== INITIALIZATION ==============================
// ============================================================================

// Section manual toggle
sectionManualCheckbox.addEventListener('change', () => {
    sectionManualInputs.classList.toggle('hidden', !sectionManualCheckbox.checked);
    toggleDropdowns(sectionCategoryDropdown, sectionDesignationDropdown, sectionManualCheckbox.checked);
});

// Category dropdown
sectionCategoryDropdown.addEventListener('change', () => {
    updateDesignationDropdown(sectionCategoryDropdown, sectionDesignationDropdown);
});

document.addEventListener('DOMContentLoaded', () => {
    // Card selection
    document.querySelectorAll('.section-card').forEach(card => {
        card.addEventListener('click', handleSectionSelection);
    });

    // Back button
    backButton.addEventListener('click', resetToSelection);

    // Reset button
    resetBtn.addEventListener('click', resetForm);

    // Calculate button
    calculateBtn.addEventListener('click', calculateSectionProperties);

    // Top angle manual toggle
    topManualCheckbox.addEventListener('change', () => {
        topManualInputs.classList.toggle('hidden', !topManualCheckbox.checked);
        toggleDropdowns(topCategoryDropdown, topDesignationDropdown, topManualCheckbox.checked);
    });

    // Bottom angle manual toggle
    bottomManualCheckbox.addEventListener('change', () => {
        bottomManualInputs.classList.toggle('hidden', !bottomManualCheckbox.checked);
        toggleDropdowns(bottomCategoryDropdown, bottomDesignationDropdown, bottomManualCheckbox.checked);
    });

    // Different angles toggle
    differentAnglesCheckbox.addEventListener('change', () => {
        bottomAngleSection.classList.toggle('hidden', !differentAnglesCheckbox.checked);
    });

    // Reinforcement toggles
    webReinforcementCheckbox.addEventListener('change', () => {
        webReinforcementInputs.classList.toggle('hidden', !webReinforcementCheckbox.checked);
    });

    flangeReinforcementCheckbox.addEventListener('change', () => {
        flangeReinforcementInputs.classList.toggle('hidden', !flangeReinforcementCheckbox.checked);
    });

    // Category dropdowns
    topCategoryDropdown.addEventListener('change', () => {
        updateDesignationDropdown(topCategoryDropdown, topDesignationDropdown);
    });

    bottomCategoryDropdown.addEventListener('change', () => {
        updateDesignationDropdown(bottomCategoryDropdown, bottomDesignationDropdown);
    });

    // Expression evaluation
    document.querySelectorAll('.dim-input').forEach(input => {
        input.addEventListener('blur', evaluateExpression);
    });
    sectionManualCheckbox.addEventListener('change', () => {
        sectionManualInputs.classList.toggle('hidden', !sectionManualCheckbox.checked);
        toggleDropdowns(sectionCategoryDropdown, sectionDesignationDropdown, sectionManualCheckbox.checked);
    });
	document.querySelectorAll('.angle-section input').forEach(input => {
    input.addEventListener('blur', function() {
        const section = this.closest('.angle-section');
        const leg1 = parseFloat(section.querySelector('[id$="Leg1"]').value) || 0;
        const leg2 = parseFloat(section.querySelector('[id$="Leg2"]').value) || 0;
        updateRotationControl(section, leg1, leg2);
    });
});
});

// Add to initialization section
document.querySelectorAll('.rotate-button').forEach(button => {
    button.addEventListener('click', function() {
        const section = this.closest('.angle-section');
        const leg1Input = section.querySelector('[id$="Leg1"]');
        const leg2Input = section.querySelector('[id$="Leg2"]');
        
        // Swap leg values
        [leg1Input.value, leg2Input.value] = [leg2Input.value, leg1Input.value];
        
        // Update attached leg tracking
        const display = section.querySelector('.attached-leg-display');
        const currentLeg = display.getAttribute('data-attached-leg');
        const newLeg = currentLeg === 'leg1' ? 'leg2' : 'leg1';
        
        // Update UI and data attribute
        display.setAttribute('data-attached-leg', newLeg);
        display.textContent = newLeg === 'leg1' ? 'Leg 1' : 'Leg 2';
        
        // Recalculate if output is visible
        if (!outputContainer.classList.contains('hidden')) {
            calculateSectionProperties();
        }
    });
});

// ==========================================================================
// ============================== UI FUNCTIONS ==============================
// ==========================================================================


function handleSectionSelection(event) {
    const selectedCard = event.currentTarget;
    currentSectionType = selectedCard.dataset.type;

    // Update UI
    sectionTitle.textContent = sectionTitles[currentSectionType];
    cardsContainer.classList.add('hidden');
    inputContainer.classList.remove('hidden');
    backButton.classList.remove('hidden');
    angleSpecificOptions.classList.toggle('hidden', currentSectionType !== 'angle');

    // Initialize dropdowns
    standardSectionOptions.classList.toggle('hidden', currentSectionType === 'angle');

if (currentSectionType === 'angle') {
    webReinforcementCheckbox.disabled = true;
    webReinforcementCheckbox.checked = false;
    webReinforcementInputs.classList.add('hidden');
	flangeReinforcementCheckbox.disabled = true;
	flangeReinforcementCheckbox.checked = false;
	flangeReinforcementInputs.classList.add('hidden');
	document.querySelectorAll('.rotation-control').forEach(el => {
        el.classList.add('hidden');
		});
} else {
    webReinforcementCheckbox.disabled = false;
	flangeReinforcementCheckbox.disabled =false;
}
    // Initialize dropdowns
    if (currentSectionType === 'angle') {
        initializeAngleDropdowns();
    } else {
        initializeStandardSectionDropdowns();

        // Show correct manual inputs
        if (currentSectionType === 'isection') {
            iSectionManual.classList.remove('hidden');
            channelManual.classList.add('hidden');
        } else if (currentSectionType === 'channel') {
            iSectionManual.classList.add('hidden');
            channelManual.classList.remove('hidden');
        }
        if (sectionManualCheckbox.checked) {
            sectionManualInputs.classList.remove('hidden');
        }
    }
    initializeDropdowns();
}

function resetToSelection() {
    inputContainer.classList.add('hidden');
    outputContainer.classList.add('hidden');
    cardsContainer.classList.remove('hidden');
    backButton.classList.add('hidden');
    resetForm();
}

function initializeStandardSectionDropdowns() {
    // Populate category dropdown for current section type
    populateCategoryDropdown(sectionCategoryDropdown, currentSectionType);

    // Reset designation dropdown
    sectionDesignationDropdown.innerHTML = '<option value="">Select Designation</option>';
    sectionDesignationDropdown.disabled = true;
}

function resetForm() {
    // Clear all inputs
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.value = '';
    });

    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Hide all manual inputs and reinforcement sections
    topManualInputs.classList.add('hidden');
    bottomManualInputs.classList.add('hidden');
    webReinforcementInputs.classList.add('hidden');
    flangeReinforcementInputs.classList.add('hidden');
    bottomAngleSection.classList.add('hidden');

    // Reset dropdowns
    resetDropdown(topCategoryDropdown, topDesignationDropdown);
    resetDropdown(bottomCategoryDropdown, bottomDesignationDropdown);
    sectionCategoryDropdown.innerHTML = '<option value="">Select Category</option>';
    sectionDesignationDropdown.innerHTML = '<option value="">Select Designation</option>';
    sectionDesignationDropdown.disabled = true;
    sectionManualCheckbox.checked = false;
    sectionManualInputs.classList.add('hidden');

    // Hide output
    outputContainer.classList.add('hidden');
    initializeDropdowns();
}

function toggleDropdowns(categoryDropdown, designationDropdown, disabled) {
    categoryDropdown.disabled = disabled;
    designationDropdown.disabled = disabled;
}

function updateDesignationDropdown(categoryDropdown, designationDropdown) {
    const category = categoryDropdown.value;
    designationDropdown.innerHTML = '<option value="">Select Designation</option>';

    if (category && ISStandards[category]) {
        Object.keys(ISStandards[category]).forEach(designation => {
            const option = document.createElement('option');
            option.value = designation;
            option.textContent = designation;
            designationDropdown.appendChild(option);
        });
        designationDropdown.disabled = false;
    } else {
        designationDropdown.disabled = true;
    }
}

function resetDropdown(categoryDropdown, designationDropdown) {
    categoryDropdown.innerHTML = '<option value="">Select Category</option>';
    designationDropdown.innerHTML = '<option value="">Select Designation</option>';
    designationDropdown.disabled = true;
}

function initializeAngleDropdowns() {
    // Populate top category dropdown
    populateCategoryDropdown(topCategoryDropdown, 'angle');

    // Populate bottom category dropdown
    populateCategoryDropdown(bottomCategoryDropdown, 'angle');

    // Reset designations
    topDesignationDropdown.innerHTML = '<option value="">Select Designation</option>';
    bottomDesignationDropdown.innerHTML = '<option value="">Select Designation</option>';
    topDesignationDropdown.disabled = true;
    bottomDesignationDropdown.disabled = true;
}

function initializeDropdowns() {
    if (currentSectionType === 'angle') {
        initializeAngleDropdowns();
    } else {
        initializeStandardSectionDropdowns();
    }
}

function populateCategoryDropdown(dropdown, type) {
    dropdown.innerHTML = '<option value="">Select Category</option>';

    Object.keys(ISStandards).forEach(category => {
        if (category.startsWith(type)) {
            const option = document.createElement('option');
            option.value = category;
            // Use friendly name from mapping
            option.textContent = categoryNames[category] || category;
            dropdown.appendChild(option);
        }
    });
}

function updateRotationControl(section, leg1, leg2) {
    const rotationControl = section.querySelector('.rotation-control');
    // Only show control for unequal angles in manual mode
    const isManual = section.querySelector('.manual-checkbox').checked;
    rotationControl.classList.toggle('hidden', !(leg1 !== leg2 && isManual));
}


function evaluateExpression(event) {
    const input = event.target;
    const value = input.value.trim();

    if (!value) return;

    try {
        // Safely evaluate arithmetic expressions
        const result = Function(`return (${value})`)();

        if (typeof result === 'number' && !isNaN(result)) {
            input.value = result;
        }
    } catch (e) {
        // Show error but keep current value
        console.error('Invalid expression:', e);
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 2000);
    }
}

// ===================================================================================
// ============================== CALCULATION FUNCTIONS ==============================
// ===================================================================================

function calculateSectionProperties() {
    const outputContent = document.getElementById('outputContent');
    outputContent.innerHTML = '';
    outputContainer.classList.remove('hidden');

    try {
        let baseProps;
        let baseDimensions; // Add this line

        if (currentSectionType === 'angle') {
            baseProps = calculateAngleSection();
        } else {
            baseProps = calculateStandardSection();
            baseDimensions = baseProps.dimensions; // Store dimensions
        }

        // Calculate reinforcement if any
        let reinfProps = [];
        if (webReinforcementCheckbox.checked) {
            reinfProps.push(calculateWebReinforcement(baseDimensions)); // Pass dimensions
        }
        if (flangeReinforcementCheckbox.checked) {
            reinfProps.push(calculateFlangeReinforcement(baseDimensions)); // Pass dimensions
        }

        // Generate output
        generateOutput(baseProps, reinfProps);

    } catch (error) {
        outputContent.innerHTML = `
            <div class="error">
                Calculation error: ${error.message || 'Invalid input values'}
            </div>
        `;
    }
}

function calculateAngleSection() {
    // Center plate is always required
    const centerPlateWidthVal = parseFloat(centerPlateWidth.value) || 0;
    const centerPlateThicknessVal = parseFloat(centerPlateThickness.value);

    if (centerPlateWidthVal <= 0 || centerPlateThicknessVal < 0) {
        throw new Error('Center plate dimensions must be positive numbers');
    }

    // Top angles
    const topAngle = topManualCheckbox.checked ?
        getManualAngleDimensions('top') :
        getStandardAngleDimensions(topCategoryDropdown, topDesignationDropdown);

    // Bottom angles
    let bottomAngle;
    if (differentAnglesCheckbox.checked) {
        bottomAngle = bottomManualCheckbox.checked ?
            getManualAngleDimensions('bottom') :
            getStandardAngleDimensions(bottomCategoryDropdown, bottomDesignationDropdown);
    } else {
        bottomAngle = {
            ...topAngle
        }; // Copy top angles
    }

    // Validate angles
    if (!topAngle || !bottomAngle) {
        throw new Error('Invalid angle dimensions');
    }

    // Calculate properties
    return calculateAngleProperties(topAngle, bottomAngle, centerPlateWidthVal, centerPlateThicknessVal);
}

function getManualAngleDimensions(prefix) {
    const leg1 = parseFloat(document.getElementById(`${prefix}Leg1`).value) || 0;
    const leg2 = parseFloat(document.getElementById(`${prefix}Leg2`).value) || 0;
    const thickness = parseFloat(document.getElementById(`${prefix}Thickness`).value) || 0;

    if (leg1 <= 0 || leg2 <= 0 || thickness <= 0) {
        throw new Error(`${prefix} angle dimensions must be positive numbers`);
    }
	

    const sectionElement = document.getElementById(`${prefix}ManualInputs`).closest('.angle-section');
    const attachedLegDisplay = sectionElement.querySelector('.attached-leg-display');
    const attachedLeg = attachedLegDisplay ? attachedLegDisplay.getAttribute('data-attached-leg') : 'leg1';

    // Simple rectangular approximation
    const vertical = attachedLeg === 'leg1' ? leg1 : leg2;
    return {
        leg1: attachedLeg === 'leg1' ? leg1 : leg2,
        leg2: attachedLeg === 'leg1' ? leg2 : leg1,
        thickness,
        area: thickness * (leg1 + leg2 - thickness),
        Ixx_local: (thickness * Math.pow(vertical, 3)) / 12,
        Iyy_local: (vertical * Math.pow(thickness, 3)) / 12,
        orientation: attachedLeg
    };
}

function getStandardAngleDimensions(categoryDropdown, designationDropdown) {
    const category = categoryDropdown.value;
    const designation = designationDropdown.value;
    if (!category || !designation) throw new Error('Please select both category and designation');

    const sectionData = ISStandards[category][designation];
    if (!sectionData) throw new Error(`Section data not found for ${designation}`);

    // Get attached leg orientation
    const sectionElement = categoryDropdown.closest('.angle-section');
    const attachedLegDisplay = sectionElement.querySelector('.attached-leg-display');
    const attachedLeg = attachedLegDisplay ? attachedLegDisplay.getAttribute('data-attached-leg') : 'leg1';

    // Parse dimensions from designation
    const dimStr = designation.split(' ')[1];
    if (!dimStr) throw new Error('Invalid angle designation format');
    
    let leg1, leg2, thickness;
    if (dimStr.includes('x')) {
        const parts = dimStr.split(/[xX]/);
        if (parts.length !== 3) throw new Error('Invalid angle format');
        [leg1, leg2, thickness] = parts.map(Number);
    } else {
        leg1 = parseInt(dimStr.substring(0, 2));
        leg2 = parseInt(dimStr.substring(2, 4));
        thickness = parseInt(dimStr.substring(4));
    }

    // Return full properties
    return {
        leg1: attachedLeg === 'leg1' ? leg1 : leg2,
        leg2: attachedLeg === 'leg1' ? leg2 : leg1,
        thickness,
        area: sectionData.sectionalarea * 100, // cm² → mm²
        Ixx_local: sectionData.ixx * 10000,   // cm⁴ → mm⁴
        Iyy_local: sectionData.iyy * 10000,   // cm⁴ → mm⁴
        orientation: attachedLeg
    };
}

function calculateAngleProperties(topAngle, bottomAngle, plateWidth, plateThickness) {
    const H_web = plateWidth;
    const t_web = plateThickness;
    
    // Get top attached leg
    const topAttachedLeg = topAngle.orientation;
    let bottomAttachedLeg = bottomAngle.orientation;
    if (differentAnglesCheckbox.checked) {
        const display = bottomAngleSection.querySelector('.attached-leg-display');
        if (display) {
            bottomAttachedLeg = display.getAttribute('data-attached-leg');
        }
    }

    // Calculate actual centroids for angles
    const topVertical = topAttachedLeg === 'leg1' ? topAngle.leg1 : topAngle.leg2;
    const topHorizontal = topAttachedLeg === 'leg1' ? topAngle.leg2 : topAngle.leg1;
    const bottomVertical = bottomAttachedLeg === 'leg1' ? bottomAngle.leg1 : bottomAngle.leg2;
    const bottomHorizontal = bottomAttachedLeg === 'leg1' ? bottomAngle.leg2 : bottomAngle.leg1;

    const topCentroid = calculateAngleCentroid(topVertical, topHorizontal, topAngle.thickness);
    const bottomCentroid = calculateAngleCentroid(bottomVertical, bottomHorizontal, bottomAngle.thickness);

    // Calculate areas
    const topArea = topAngle.thickness * (topAngle.leg1 + topAngle.leg2 - topAngle.thickness);
    const bottomArea = bottomAngle.thickness * (bottomAngle.leg1 + bottomAngle.leg2 - bottomAngle.thickness);
    const plateArea = H_web * t_web;
    const totalArea = 2 * topArea + 2 * bottomArea + plateArea;

    // Calculate neutral axis from bottom (Cxx)
    const topY = H_web + topCentroid;  // Distance from bottom to top angle centroid
    const bottomY = bottomCentroid;    // Distance from bottom to bottom angle centroid
    const plateY = H_web / 2;          // Distance from bottom to plate centroid
    
    const Cxx = (
        (2 * topArea * topY) + 
        (2 * bottomArea * bottomY) + 
        (plateArea * plateY)
    ) / totalArea;

    // Calculate moments of inertia (using parallel axis theorem)
    const Ixx_plate = (t_web * Math.pow(H_web, 3)) / 12;
    
    // Top angle contribution
    const topDistance = topY - Cxx;
    const Ixx_top_local = calculateAngleIxx(topVertical, topHorizontal, topAngle.thickness);
    const Ixx_top = Ixx_top_local + topArea * Math.pow(topDistance, 2);
    
    // Bottom angle contribution
    const bottomDistance = bottomY - Cxx;
    const Ixx_bottom_local = calculateAngleIxx(bottomVertical, bottomHorizontal, bottomAngle.thickness);
    const Ixx_bottom = Ixx_bottom_local + bottomArea * Math.pow(bottomDistance, 2);
    
    // Total Ixx
    const Ixx = Ixx_plate + 2 * Ixx_top + 2 * Ixx_bottom;
    
    // Calculate Iyy properly
    const Iyy_plate = (H_web * Math.pow(t_web, 3)) / 12;
    
    // Calculate angle Iyy contributions
    const Iyy_top = calculateAngleIyy(topVertical, topHorizontal, topAngle.thickness);
    const Iyy_bottom = calculateAngleIyy(bottomVertical, bottomHorizontal, bottomAngle.thickness);
    
    // Distance from center to angle centroids
    const dx_top = (t_web/2) + (topHorizontal - calculateAngleCentroidX(topVertical, topHorizontal, topAngle.thickness));
    const dx_bottom = (t_web/2) + (bottomHorizontal - calculateAngleCentroidX(bottomVertical, bottomHorizontal, bottomAngle.thickness));
    
    // Total Iyy (4 angles - 2 top + 2 bottom)
    const Iyy = Iyy_plate + 
                2 * (Iyy_top + topArea * Math.pow(dx_top, 2)) + 
                2 * (Iyy_bottom + bottomArea * Math.pow(dx_bottom, 2));

    // Section moduli
    const maxTop = topVertical + (H_web - topCentroid);
    const maxBottom = bottomVertical - bottomCentroid;
    const Zxx = Ixx / Math.max(Cxx, maxTop, maxBottom);
    
    // Extreme fiber distance for y-axis
    const extremeX = Math.max(
        dx_top + (topHorizontal - calculateAngleCentroidX(topVertical, topHorizontal, topAngle.thickness)),
        dx_bottom + (bottomHorizontal - calculateAngleCentroidX(bottomVertical, bottomHorizontal, bottomAngle.thickness))
    );
    const Zyy = Iyy / extremeX;
    
    const Rxx = Math.sqrt(Ixx / totalArea);
    const Ryy = Math.sqrt(Iyy / totalArea);

    return {
        type: 'Angle Compound Section',
        topAngle,
        bottomAngle,
        Cxx,
        orientation: {
            top: topAttachedLeg,
            bottom: bottomAttachedLeg
        },
        h: H_web,
        b: t_web,
        area: totalArea,
        Ixx,
        Iyy,
        Zxx,
        Zyy,
        Rxx,
        Ryy
    };
}

// New helper functions
function calculateAngleCentroidX(verticalLeg, horizontalLeg, thickness) {
    const area1 = verticalLeg * thickness;
    const area2 = (horizontalLeg - thickness) * thickness;
    const totalArea = area1 + area2;
    
    const x1 = thickness / 2;
    const x2 = thickness + (horizontalLeg - thickness) / 2;
    
    return (area1 * x1 + area2 * x2) / totalArea;
}

function calculateAngleIyy(verticalLeg, horizontalLeg, thickness) {
    // Calculate local Iyy about centroid
    const centroidX = calculateAngleCentroidX(verticalLeg, horizontalLeg, thickness);
    
    // Iyy for vertical part
    const Iyy1 = (verticalLeg * Math.pow(thickness, 3)) / 12;
    const A1 = verticalLeg * thickness;
    const d1 = Math.abs(thickness/2 - centroidX);
    
    // Iyy for horizontal part
    const Iyy2 = ((horizontalLeg - thickness) * Math.pow(thickness, 3)) / 12;
    const A2 = (horizontalLeg - thickness) * thickness;
    const d2 = Math.abs(thickness + (horizontalLeg - thickness)/2 - centroidX);
    
    return Iyy1 + A1 * d1 * d1 + Iyy2 + A2 * d2 * d2;
}

function calculateAngleIxx(verticalLeg, horizontalLeg, thickness) {
    // Calculate local Ixx about centroid
    const centroid = calculateAngleCentroid(verticalLeg, horizontalLeg, thickness);
    
    // Ixx for vertical part
    const Ixx1 = (thickness * Math.pow(verticalLeg, 3)) / 12;
    const A1 = verticalLeg * thickness;
    const d1 = Math.abs(verticalLeg/2 - centroid);
    
    // Ixx for horizontal part
    const Ixx2 = (horizontalLeg * Math.pow(thickness, 3)) / 12;
    const A2 = horizontalLeg * thickness;
    const d2 = Math.abs(thickness/2 - centroid);
    
    return Ixx1 + A1 * d1 * d1 + Ixx2 + A2 * d2 * d2;
}

function calculateAngleCentroid(verticalLeg, horizontalLeg, thickness) {
    // Calculate centroid from the corner (where both legs meet)
    const areaVertical = verticalLeg * thickness;
    const areaHorizontal = (horizontalLeg - thickness) * thickness;
    const totalArea = areaVertical + areaHorizontal;
    
    // Distance from corner to vertical part centroid
    const verticalCentroid = verticalLeg / 2;
    
    // Distance from corner to horizontal part centroid
    const horizontalCentroid = thickness / 2;
    
    return (areaVertical * verticalCentroid + areaHorizontal * horizontalCentroid) / totalArea;
}

function calculateStandardSection() {
    let sectionData;

    if (sectionManualCheckbox.checked) {
        // Manual input calculations
        if (currentSectionType === 'isection') {
            sectionData = {
                h: parseFloat(document.getElementById('iHeight').value) || 0,
                b: parseFloat(document.getElementById('iFlangeWidth').value) || 0,
                tw: parseFloat(document.getElementById('iWebThickness').value) || 0,
                tf: parseFloat(document.getElementById('iFlangeThickness').value) || 0
            };

            // Validate inputs
            if (sectionData.h <= 0 || sectionData.b <= 0 || sectionData.tw <= 0 || sectionData.tf <= 0) {
                throw new Error('I-section dimensions must be positive numbers');
            }

            // Calculate properties
            const area = (2 * sectionData.b * sectionData.tf) +
                ((sectionData.h - 2 * sectionData.tf) * sectionData.tw);

            const Ixx = (sectionData.b * Math.pow(sectionData.h, 3) / 12) -
                ((sectionData.b - sectionData.tw) * Math.pow(sectionData.h - 2 * sectionData.tf, 3) / 12);

            const Iyy = (sectionData.tf * Math.pow(sectionData.b, 3) * 2 / 12) +
                ((sectionData.h - 2 * sectionData.tf) * Math.pow(sectionData.tw, 3) / 12);

            const Zxx = Ixx / (sectionData.h / 2);
            const Zyy = Iyy / (sectionData.b / 2);
            const Rxx = Math.sqrt(Ixx / area);
            const Ryy = Math.sqrt(Iyy / area);

            return {
                type: 'I-Section',
                area,
                Ixx,
                Iyy,
                Zxx,
                Zyy,
                Rxx,
                Ryy,
				dimensions: {
                    h: sectionData.h,
                    b: sectionData.b,
                    tw: sectionData.tw,
                    tf: sectionData.tf
                }
            };

        } else { // Channel section
            sectionData = {
                h: parseFloat(document.getElementById('cHeight').value) || 0,
                b: parseFloat(document.getElementById('cFlangeWidth').value) || 0,
                tw: parseFloat(document.getElementById('cWebThickness').value) || 0,
                tf: parseFloat(document.getElementById('cFlangeThickness').value) || 0
            };

            // Validate inputs
            if (sectionData.h <= 0 || sectionData.b <= 0 || sectionData.tw <= 0 || sectionData.tf <= 0) {
                throw new Error('Channel dimensions must be positive numbers');
            }

            // Calculate properties
            const area = 2 * ((2 * sectionData.b * sectionData.tf) +
                ((sectionData.h - 2 * sectionData.tf) * sectionData.tw));

            // Simplified calculations for channel sections
            const Ixx = ((sectionData.tw * Math.pow(sectionData.h, 3) / 12) +
                (2 * sectionData.b * sectionData.tf * Math.pow(sectionData.h / 2 - sectionData.tf / 2, 2))) * 2;

            const Iyy = 2 * (2 * sectionData.tf * (Math.pow(sectionData.b, 3) / 3) + (sectionData.h - 2 * sectionData.tf) * (Math.pow(sectionData.tw, 3) / 3));

            const Zxx = Ixx / (sectionData.h / 2);
            const Zyy = Iyy / (sectionData.b / 2);
            const Rxx = Math.sqrt(Ixx / area);
            const Ryy = Math.sqrt(Iyy / area);

            return {
                type: 'Channel Section',
                area,
                Ixx,
                Iyy,
                Zxx,
                Zyy,
                Rxx,
                Ryy,
				dimensions: {
                    h: sectionData.h,
                    b: sectionData.b,
                    tw: sectionData.tw,
                    tf: sectionData.tf
                }
            };
        }
    }
    //standard section of I Beam
    else {
        if (currentSectionType === 'isection') {
            // Standard section from IS:808 data
            const category = sectionCategoryDropdown.value;
            const designation = sectionDesignationDropdown.value;

            if (!category || !designation) {
                throw new Error('Please select both category and designation');
            }

            const sectionData = ISStandards[category][designation];
            if (!sectionData) throw new Error(`Data not found for ${designation}`);

            // Convert from cm to mm
            return {
                type: `${currentSectionType} Section`,
                area: sectionData.sectionalareaaincm2 * 100, // cm² → mm²
                Ixx: sectionData.ixx * 10000, // cm⁴ → mm⁴
                Iyy: sectionData.iyy * 10000, // cm⁴ → mm⁴
                Zxx: sectionData.zxx * 1000, // cm³ → mm³
                Zyy: sectionData.zyy * 1000, // cm³ → mm³
                Rxx: sectionData.rxx * 10, // cm → mm
                Ryy: sectionData.ryy * 10, // cm → mm
				dimensions: {
                    h: sectionData.h * 10,
                    b: sectionData.b * 10,
                    tw: sectionData.tw * 10,
                    tf: sectionData.tf * 10
                }
            };
        }

        // Standard secton of Channel
        else {
            const category = sectionCategoryDropdown.value;
            const designation = sectionDesignationDropdown.value;

            if (!category || !designation) {
                throw new Error('Please select both category and designation');
            }

            const sectionData = ISStandards[category][designation];
            if (!sectionData) throw new Error(`Data not found for ${designation}`);
            const AREA = sectionData.sectionalareaaincm2 * 2 * 100;
            const Ixx = sectionData.ixxcm4 * 10000 * 2;
            const Iyy = 2 * ((sectionData.iyycm4 * 10000) + ((sectionData.sectionalareaaincm2 * 100) * Math.pow(sectionData.cyy, 2)));
            const Zxx = Ixx / (sectionData.h / 2);
            const Zyy = Iyy / (sectionData.b);
            const Rxx = Math.sqrt(Ixx / AREA);
            const Ryy = Math.sqrt(Iyy / AREA);

            // Convert from cm to mm
            return {
                type: `${currentSectionType} Section`,
                area: AREA,
                Ixx: Ixx,
                Iyy: Iyy,
                Zxx: Zxx,
                Zyy: Zyy,
                Rxx: Rxx,
                Ryy: Ryy,
				dimensions: {
                    h: sectionData.h * 10,
                    b: sectionData.b * 10,
                    tw: sectionData.tw * 10,
                    tf: sectionData.tf * 10
                }
            };

        }
    }
}

function calculateWebReinforcement(baseDimensions) {
    const thickness = parseFloat(document.getElementById('webThickness').value) || 0;
    const height = parseFloat(document.getElementById('webHeight').value) || 0;

    if (thickness <= 0 || height <= 0) {
        throw new Error('Web reinforcement dimensions must be positive');
    }

    // Area of one plate
    const areaOnePlate = thickness * height;
    
    // Local moments of inertia for one plate
    const IxxLocal = (thickness * Math.pow(height, 3)) / 12;
    const IyyLocal = (height * Math.pow(thickness, 3)) / 12;
    
    // Distance from section centroid to plate centroid
    const dx = (baseDimensions.tw / 2) + (thickness / 2);
    
    // Total properties for two plates
    const area = 2 * areaOnePlate;
    const Ixx = 2 * IxxLocal;
    const Iyy = 2 * (IyyLocal + areaOnePlate * Math.pow(dx, 2));

    return {
        type: 'Web Plate',
        area,
        Ixx,
        Iyy,
        thickness,
        height
    };
}

// Rectangle properties calculator (local Ixx, Iyy)
function rectProperties(width, height) {
    return {
        area: width * height,
        Ixx: (width * Math.pow(height, 3)) / 12,
        Iyy: (height * Math.pow(width, 3)) / 12
    };
}

function calculateFlangeReinforcement(baseDimensions) {
    const thickness = parseFloat(document.getElementById('flangeThickness').value) || 0;
    const width = parseFloat(document.getElementById('flangeWidth').value) || 0;

    if (thickness <= 0 || width <= 0) {
        throw new Error('Flange reinforcement dimensions must be positive');
    }

    // Area of one plate
    const areaOnePlate = thickness * width;
    
    // Local moments of inertia for one plate
    const IxxLocal = (width * Math.pow(thickness, 3)) / 12;
    const IyyLocal = (thickness * Math.pow(width, 3)) / 12;
    
    // Distance from section centroid to plate centroid
    const dy = (baseDimensions.h / 2) + (thickness / 2);
    
    // Total properties for two plates
    const area = 2 * areaOnePlate;
    const Ixx = 2 * (IxxLocal + areaOnePlate * Math.pow(dy, 2));
    const Iyy = 2 * IyyLocal;

    return {
        type: 'Flange Plates',
        area,
        Ixx,
        Iyy,
        thickness,
        width
    };
}

function calculateCentroidFromBottom() {
    // Simplified centroid calculation
    return (topAngle.leg1 + bottomAngle.leg1 + plateThickness) / 3;
}
// ===============================================================================
// ============================== OUTPUT GENERATION ==============================
// ===============================================================================

function generateOutput(baseProps, reinfProps) {
    let outputHTML = '';

    // Base section output
    if (currentSectionType === 'angle') {
        outputHTML += `
            <div class="output-note">
                Neutral axis x-x from bottom: <strong>${baseProps.Cxx.toFixed(1)} mm</strong>
            </div>
            <div class="output-item">
                <h4>${sectionTitles.angle}</h4>
                <div class="property-grid">
                    <div class="property-item">
                        <strong>Center Plate:</strong>
                        <span>${baseProps.h.toFixed(1)} × ${baseProps.b.toFixed(1)} mm</span>
                    </div>
                    <div class="property-item">
                        <strong>Top Angles:</strong>
                        <span>${baseProps.topAngle.leg1.toFixed(1)} × ${baseProps.topAngle.leg2.toFixed(1)} × ${baseProps.topAngle.thickness.toFixed(1)} mm</span>
                    </div>
                    <div class="property-item">
                        <strong>Bottom Angles:</strong>
                        <span>${baseProps.bottomAngle.leg1.toFixed(1)} × ${baseProps.bottomAngle.leg2.toFixed(1)} × ${baseProps.bottomAngle.thickness.toFixed(1)} mm</span>
                    </div>
                    <div class="property-item">
                        <strong>Area:</strong>
                        <span>${baseProps.area.toFixed(1)} mm²</span>
                    </div>
                    <div class="property-item">
                        <strong>I<sub>xx</sub>:</strong>
                        <span>${baseProps.Ixx.toFixed(1)} mm⁴</span>
                    </div>
                    <div class="property-item">
                        <strong>I<sub>yy</sub>:</strong>
                        <span>${baseProps.Iyy.toFixed(1)} mm⁴</span>
                    </div>
                    <div class="property-item">
                        <strong>Z<sub>xx</sub>:</strong>
                        <span>${baseProps.Zxx.toFixed(1)} mm³</span>
                    </div>
                    <div class="property-item">
                        <strong>Z<sub>yy</sub>:</strong>
                        <span>${baseProps.Zyy.toFixed(1)} mm³</span>
                    </div>
                    <div class="property-item">
                        <strong>R<sub>xx</sub>:</strong>
                        <span>${baseProps.Rxx.toFixed(1)} mm</span>
                    </div>
                    <div class="property-item">
                        <strong>R<sub>yy</sub>:</strong>
                        <span>${baseProps.Ryy.toFixed(1)} mm</span>
                    </div>
                </div>
            </div>
        `;
        
        // Orientation note
        outputHTML += `
            <div class="output-note">
                Top angles attached with ${baseProps.orientation.top === 'leg1' ? 'Leg 1' : 'Leg 2'}<br>
                ${differentAnglesCheckbox.checked 
                    ? `Bottom angles attached with ${baseProps.orientation.bottom === 'leg1' ? 'Leg 1' : 'Leg 2'}`
                    : 'Bottom angles same orientation as top'}
            </div>
        `;
    } 
    else {
        outputHTML = `
            <div class="output-item">
                <h4>${baseProps.type} Properties</h4>
                <div class="property-grid">
                    <div class="property-item">
                        <strong>Area:</strong>
                        <span>${baseProps.area.toFixed(1)} mm²</span>
                    </div>
                    <div class="property-item">
                        <strong>I<sub>xx</sub>:</strong>
                        <span>${baseProps.Ixx.toFixed(1)} mm⁴</span>
                    </div>
                    <div class="property-item">
                        <strong>I<sub>yy</sub>:</strong>
                        <span>${baseProps.Iyy.toFixed(1)} mm⁴</span>
                    </div>
                    <div class="property-item">
                        <strong>Z<sub>xx</sub>:</strong>
                        <span>${baseProps.Zxx.toFixed(1)} mm³</span>
                    </div>
                    <div class="property-item">
                        <strong>Z<sub>yy</sub>:</strong>
                        <span>${baseProps.Zyy.toFixed(1)} mm³</span>
                    </div>
                    <div class="property-item">
                        <strong>R<sub>xx</sub>:</strong>
                        <span>${baseProps.Rxx.toFixed(1)} mm</span>
                    </div>
                    <div class="property-item">
                        <strong>R<sub>yy</sub>:</strong>
                        <span>${baseProps.Ryy.toFixed(1)} mm</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Add reinforcement output
    if (reinfProps.length > 0) {
        reinfProps.forEach(reinf => {
            outputHTML += `
                <div class="output-item">
                    <h4>${reinf.type} Reinforcement</h4>
                    <div class="property-grid">
                        ${reinf.type === 'Web Plate' ? `
                            <div class="property-item">
                                <strong>Height:</strong>
                                <span>${reinf.height.toFixed(1)} mm</span>
                            </div>
                            <div class="property-item">
                                <strong>Thickness:</strong>
                                <span>${reinf.thickness.toFixed(1)} mm</span>
                            </div>
                        ` : `
                            <div class="property-item">
                                <strong>Width:</strong>
                                <span>${reinf.width.toFixed(1)} mm</span>
                            </div>
                            <div class="property-item">
                                <strong>Thickness:</strong>
                                <span>${reinf.thickness.toFixed(1)} mm</span>
                            </div>
                        `}
                        <div class="property-item">
                            <strong>Area:</strong>
                            <span>${reinf.area.toFixed(1)} mm²</span>
                        </div>
                        <div class="property-item">
                            <strong>I<sub>xx</sub>:</strong>
                            <span>${reinf.Ixx.toFixed(1)} mm⁴</span>
                        </div>
                        <div class="property-item">
                            <strong>I<sub>yy</sub>:</strong>
                            <span>${reinf.Iyy.toFixed(1)} mm⁴</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Combined properties if reinforcement exists
    if (reinfProps.length > 0) {
        // Calculate combined properties
        let combinedArea = baseProps.area;
        let combinedIxx = baseProps.Ixx;
        let combinedIyy = baseProps.Iyy;
        
        // Track dimension changes
        let totalHeight = baseProps.dimensions ? baseProps.dimensions.h : 0;
        let totalWidth = baseProps.dimensions ? baseProps.dimensions.b : 0;

        reinfProps.forEach(reinf => {
            combinedArea += reinf.area;
            combinedIxx += reinf.Ixx;
            combinedIyy += reinf.Iyy;
            
            // Update total dimensions
            if (reinf.type === 'Flange Plates') {
                totalHeight += 2 * reinf.thickness;
            }
            if (reinf.type === 'Web Plate') {
                totalWidth += 2 * reinf.thickness;
            }
        });

        // Calculate section moduli using new dimensions
        const combinedZxx = combinedIxx / (totalHeight / 2);
        const combinedZyy = combinedIyy / (totalWidth / 2);
        const combinedRxx = Math.sqrt(combinedIxx / combinedArea);
        const combinedRyy = Math.sqrt(combinedIyy / combinedArea);

        // Add to output
        outputHTML += `
            <div class="output-item combined-section">
                <h4>Combined Section Properties</h4>
                <div class="property-grid">
                    <div class="property-item">
                        <strong>Total Area:</strong>
                        <span>${combinedArea.toFixed(1)} mm²</span>
                    </div>
                    <div class="property-item">
                        <strong>I<sub>xx</sub>:</strong>
                        <span>${combinedIxx.toFixed(1)} mm⁴</span>
                    </div>
                    <div class="property-item">
                        <strong>I<sub>yy</sub>:</strong>
                        <span>${combinedIyy.toFixed(1)} mm⁴</span>
                    </div>
                    <div class="property-item">
                        <strong>Z<sub>xx</sub>:</strong>
                        <span>${combinedZxx.toFixed(1)} mm³</span>
                    </div>
                    <div class="property-item">
                        <strong>Z<sub>yy</sub>:</strong>
                        <span>${combinedZyy.toFixed(1)} mm³</span>
                    </div>
                    <div class="property-item">
                        <strong>R<sub>xx</sub>:</strong>
                        <span>${combinedRxx.toFixed(1)} mm</span>
                    </div>
                    <div class="property-item">
                        <strong>R<sub>yy</sub>:</strong>
                        <span>${combinedRyy.toFixed(1)} mm</span>
                    </div>
                </div>
            </div>
        `;
    }

    document.getElementById('outputContent').innerHTML = outputHTML;
}
 