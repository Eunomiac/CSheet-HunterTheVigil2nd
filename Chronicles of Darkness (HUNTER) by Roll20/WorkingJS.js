/* eslint-disable no-unused-vars */
/* eslint-disable no-constant-condition */
/* eslint-disable func-names */
/* eslint-disable vars-on-top */
/* eslint-disable eqeqeq */

const attributes = ["intelligence","wits","resolve","strength","dexterity","stamina","presence","manipulation","composure"],
    skills = ["academics","computer","crafts","investigation","medicine","occult","politics","science","athletics","brawl","drive","firearms","larceny","stealth","survival","weaponry","animalken","empathy","expression","intimidation","persuasion","socialize","streetwise","subterfuge"],
    normalStats = ["intelligence","wits","resolve","strength","dexterity","stamina","presence","manipulation","composure","academics","computer","crafts","investigation","medicine","occult","politics","science","athletics","brawl","drive","firearms","larceny","stealth","survival","weaponry","animalken","empathy","expression","intimidation","persuasion","socialize","streetwise","subterfuge"],
    allStats = ["intelligence","wits","resolve","strength","dexterity","stamina","presence","manipulation","composure","academics","computer","crafts","investigation","medicine","occult","politics","science","athletics","brawl","drive","firearms","larceny","stealth","survival","weaponry","animalken","empathy","expression","intimidation","persuasion","socialize","streetwise","subterfuge","potency"],
    potencyNames = {mortal1:"", mortal2:"", vampire1:"Blood Potency", vampire2:"Blood Potency", werewolf1:"Primal Urge", werewolf2:"Primal Urge", mage1:"Gnosis", mage2:"Gnosis", promethean1:"Azoth", promethean2:"Azoth", changeling1:"Wyrd", changeling2:"Wyrd", demon:"Primum", beast:"Lair", hunter:"", geist1:"Psyche", mummy1:"Sekhem", hunter2:""},
    superScripts = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"];

["intelligence","wits","resolve","strength","dexterity","stamina","presence","manipulation","composure","academics","computer","crafts","investigation","medicine","occult","politics","science","athletics","brawl","drive","firearms","larceny","stealth","survival","weaponry","animalken","empathy","expression","intimidation","persuasion","socialize","streetwise","subterfuge","potency"].forEach((attr) => {
    on(`change:${attr} change:${attr}_flag`, (eventInfo) => {
        const source = eventInfo.sourceAttribute,
            attribute = attr.includes("flag") ? attr.split("_flag")[0] : attr // Remove the "_flag" part so we can pass the name

            // if (!eventInfo.sourceAttribute.endsWith("_flag") || "previousValue" in eventInfo) {
        console.log(`==== Ch:Trait/Flag: ${eventInfo.sourceType} ==== updateRollData('${attribute}'):\n${JSON.stringify(eventInfo)}`)
        updateRollData(`${attribute}`)
            // }

        if (source === "resolve_flag" || source === "composure_flag") 
            updateWillpower()
            

        if (source === "wits" || source === "composure") 
            updateMoralHealth()
            

        if (source === "wits" || source === "dexterity" || source === "athletics" || source === "brawl" || source === "weaponry") 
            getAttrs(["defense_select"], (v) => { // PRD-1407
                updateDefense(v.defense_select)
            })
        

        if (source === "stamina" || source === "resilience") 
            updateHealth()
            
    })
});

[...Array(5).keys()].forEach((attr) => {
    on(`change:attack_type${attr}`, (eventInfo) => {// checks attack_type0 trough attack_type4
        if (true /* eventInfo.sourceType != "sheetworker" */) {
            console.log(`==== Ch:ATTACK_TYPE: ${eventInfo.sourceType} ==== updateRollData('rolltype'):\n${JSON.stringify(eventInfo)}`)
            updateRollData("rolltype")
        }
    })
})

on("change:attack", function(eventInfo) {
    if (true /* eventInfo.sourceType != "sheetworker" */) {
        console.log(`==== Ch:ATTACK: ${eventInfo.sourceType} ==== updateRollData('rolltype'):\n${JSON.stringify(eventInfo)}`)
        updateRollData("rolltype", "previousValue" in eventInfo)
        updateAttacks()
    }
});

["_initiative0","_initiative1","_initiative2","_initiative3","_initiative4","_strength0","_strength1","_strength2","_strength3","_strength4"].forEach((attr) => {
    on(`change:attack${attr}`, (eventInfo) => {
        updateAttacks()
    })
});

["","_flag0","_flag1","_flag2","_strength0","_strength1","_strength2"].forEach((attr) => {
    on(`change:armor${attr}`, (eventInfo) => {
        updateAttacks()
    })
})

on("change:health", function() {
    updateAttacks()
});

[...Array(16).keys()].forEach((attr) => {// healthbox nr. 1 through 16
    on(`change:healthbox_${attr+1}`, (eventInfo) => {
        updateAttacks()
    })
})

on("change:base_size change:giant change:small_framed change:bonus_health", function() {
    updateHealth()
})

on("change:sheettype", function(eventInfo) {
    if (true /* eventInfo.sourceType != "sheetworker" */) {
        updateHealth()
        updateDefaultDefense()
        updatePotencyName()
        console.log(`==== Ch:SHEETTYPE: ${eventInfo.sourceType} ==== updateRollData():\n${JSON.stringify(eventInfo)}`)
        updateRollData()
    }
})

on("change:bonus_willpower", function() {
    updateWillpower()
})

on("change:bonus_moralhealth", function() {
    updateMoralHealth()
})

on("change:defense_select", function(eventInfo) {
    updateDefense(eventInfo.newValue)
})

on("change:iron_stamina", function() {
    updateWoundPenalties()
})

on("change:rolltype_select change:rerolldice change:spendwp change:specialty", function(eventInfo) {
    if (!(eventInfo.sourceAttribute === "rerolldice" && eventInfo.newValue == "-1")) {
        console.log(`==== Ch:ROLL FLAGS: ${eventInfo.sourceType} ==== updateRollData():\n${JSON.stringify(eventInfo)}`)
        updateRollData()
    }
})

on("change:rollmodifier change:rolltype change:rolltypeattack", function(eventInfo) {
    if (true /* eventInfo.sourceType != "sheetworker" */) {
        console.log(`==== Ch:ROLLMOD: ${eventInfo.sourceType} ==== updateRollData('rolltype'):\n${JSON.stringify(eventInfo)}`)
        updateRollData("rolltype", eventInfo.sourceAttribute === "rerolldice" && eventInfo.newValue == "-1")
    }
})

on("sheet:opened", function() {
    updateDefaultDefense()
    updatePotencyName()
    updateRollData()
})
// ---------------------------------- Translation functions ------------------------------------------
on("sheet:opened", function(){
    setAttrs({
        dicepoolmacro: getTranslationByKey("dice-pool"),
        modifiermacro: getTranslationByKey("modifiers"),
        unarmedmacro: getTranslationByKey("unarmed")
    })
})

// --------------------------------------------------------------------------------------------------

const updateRollData = function(stat = "rolltype", isClearingFlags = false) {
        const statFlag = `${stat }_flag`
        let type,
            rarray = []
        getAttrs([
            "rolltype_select", "sheettype","rollflag_chance", "rerolldice", "spendwp", "specialty", "rolltype", "rolltypeattack", "rollattack", "rollstyle","rollmodifier","roll_array",
            "attack", "target_defense", "wound_penalty", "weapon_penalty", "armor_penalty", 
            "attack_type0","attack_type1","attack_type2","attack_type3","attack_type4", "attack_name0","attack_name1","attack_name2","attack_name3","attack_name4","attack_damage0","attack_damage1","attack_damage2","attack_damage3","attack_damage4",
            "intelligence_flag","wits_flag","resolve_flag","strength_flag","dexterity_flag","stamina_flag","presence_flag","manipulation_flag","composure_flag","academics_flag","computer_flag",
            "crafts_flag","investigation_flag","medicine_flag","occult_flag","politics_flag","science_flag","athletics_flag","brawl_flag","drive_flag","firearms_flag","larceny_flag","stealth_flag","survival_flag","weaponry_flag",
            "animalken_flag","empathy_flag","expression_flag","intimidation_flag","persuasion_flag","socialize_flag","streetwise_flag","subterfuge_flag","intelligence","wits","resolve","strength","dexterity","stamina",
            "presence","manipulation","composure","academics","computer","crafts","investigation","medicine","occult","politics","science","athletics","brawl","drive","firearms","larceny","stealth","survival","weaponry",
            "animalken","empathy","expression","intimidation","persuasion","socialize","streetwise","subterfuge",            
            "potency","potency_flag","potency_name"
        ], function(v) {
            let consoleLines = [],
                chanceResult = "[[{1d10cf<1}>10]]"
            for (const [name, val] of Object.entries(v))
                consoleLines.push(` V: ${name.toUpperCase()}: ${typeof val === "string" ? `"${val}"` : val}`)
            consoleLines.push(" ")
            let attrList = {
                rollsimple: "&{template:wod-simple} {{name=@{character_name}}} {{option=?{@{dicepoolmacro} || 0}}} {{result=[[{(?{@{dicepoolmacro}|1}",
                rollchance: "&{template:wod-simple} {{name=@{character_name}}} {{result=[[{1d10cs>10cf<1}>10]]}} {{chance=[[1]]}}"
            }
            switch (v.rerolldice) {
                case "0": {
                    attrList.rolltype = ")d10cs>11cf<0}>8]]}} {{noreroll=1}}"
                    attrList.rolltypeattack = ")d10cs>11cf<0}>8]]}} {{noreroll=1}}"
                    attrList.rollsimple += ")d10cs>11cf<0}>8]]}} {{noreroll=1}} {{chance=[[0]]}}"
                    break
                }
                case "10": {
                    attrList.rolltype = ")d10!cs>10cf<0}>8]]}}"
                    attrList.rolltypeattack = ")d10!cs>10cf<0}>8]]}}"
                    attrList.rollsimple += ")d10!cs>10cf<0}>8]]}} {{chance=[[0]]}}"
                    break
                }
                case "9": {
                    attrList.rolltype = ")d10!>9cs>9cf<0}>8]]}} {{9again=1}}"
                    attrList.rolltypeattack = ")d10!>9cs>9cf<0}>8]]}} {{9again=1}}"
                    attrList.rollsimple += ")d10!>9cs>9cf<0}>8]]}} {{9again=1}} {{chance=[[0]]}}"
                    break
                }
                case "8": {
                    attrList.rolltype = ")d10!>8cs>8cf<0}>8]]}} {{8again=1}}"
                    attrList.rolltypeattack = ")d10!>8cs>8cf<0}>8]]}} {{8again=1}}"
                    attrList.rollsimple += ")d10!>8cs>8cf<0}>8]]}} {{8again=1}} {{chance=[[0]]}}"
                    break
                }
                case "1": {
                    attrList.rolltype = ")d10!cs>10ro<7cf<0}>8]]}} {{rote=1}}"
                    attrList.rolltypeattack = ")d10!cs>10ro<7cf<0}>8]]}} {{rote=1}}"
                    attrList.rollsimple += ")d10!cs>10ro<7cf<0}>8]]}} {{rote=1}} {{chance=[[0]]}}"
                    attrList.rollchance = "&{template:wod-simple} {{name=@{character_name}}} {{option=1}} {{result=[[{1d10cs>10ro<7cf<1}>10]]}} {{chance=[[1]]}} {{rote=1}}"
                    chanceResult = "[[{1d10cs>10ro<7cf<1}>10]]"
                    break
                }
                // no default
            }
            attrList.rolltypechanceresult = `{{chanceresult=${chanceResult}}`

            for (const [name, val] of Object.entries(attrList))
                consoleLines.push(` U: ${name.toUpperCase()}: ${typeof val === "string" ? `"${val}"` : val}`)

            consoleLines = consoleLines.map(x => `@-UT-@ ${x}`)
            consoleLines.unshift(...[
                " ",
                " ",
                "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
                "@@@@@@ UPDATE ROLLTYPE: ATTRIBUTES PASSED... @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
                "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
            ])
            consoleLines.push(...[
                "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
                " ",
                " "
            ])
            // console.log(consoleLines.join("\n"))
            consoleLines = []
            Object.assign(v, attrList)
            allStats.forEach(function(x) {
                const flagname = `${x }_flag`
                if(parseInt(v[flagname], 10) != 0) 
                    rarray.push(x)
                
            })
            const prevRArray = v.roll_array && v.roll_array != "" ? v.roll_array.split(",") : []
            for (const [name, val] of Object.entries(v))
                if (`${val}` !== "0" && val && !normalStats.includes(name.toLowerCase()))
                    consoleLines.push(` V: ${name.toUpperCase()}: ${typeof val === "string" ? `"${val}"` : val}`)
            consoleLines.push(" ")
            if(stat != "rolltype") {
                if(parseInt(v[statFlag], 10) === 0) {
                    if(rarray.indexOf(stat) > -1) 
                        rarray.splice(rarray.indexOf(stat), 1)
                    
                }
                else if (stat != "potency") {
                    if(attributes.indexOf(stat) > -1) 
                        type = "attribute"
                    
                    else if(skills.indexOf(stat) > -1) 
                        type = "skill"
                    
                    if(type === "attribute") 
                        if(rarray.filter(function(x){return attributes.indexOf(x) > -1}).length > 1) {
                            rarray = [stat, prevRArray.filter(function(x){return attributes.indexOf(x) > -1})[0]]
                        }
                    
                    if(type === "skill") {
                        const attrFilter = rarray.filter(function(x){return attributes.indexOf(x) > -1}),
                            skillFilter = rarray.filter(function(x){return skills.indexOf(x) > -1})
                        if(attrFilter.length < 2 && skillFilter.length === 0) {
                            rarray.unshift(stat)
                        }else if(attrFilter.length < 2 && skillFilter.length > 0) {
                            rarray = rarray.filter(function(x) {return skills.indexOf(x) < 0})
                            rarray.unshift(stat)
                        }else if(attrFilter.length > 1) {
                            rarray = [stat, prevRArray.filter(function(x){return attributes.indexOf(x) > -1})[0]]// This could probably be done with .shift instead of the filter, but I don't know what's going on the grand scheme of things so...
                        }
                    }
                    if(type === "power") 
                        if(rarray.filter(function(x){return normalStats.indexOf(x) === -1}).length > 0) {
                            rarray = rarray.filter(function(x){return normalStats.indexOf(x) > -1})
                            rarray.unshift(stat)
                        }
                        else {
                            rarray.unshift(stat)
                        }
                    
                }
                if(rarray.length > 3) 
                    rarray.length = 3
                
                attrList.rerolldice = "10"
                attrList.rollmodifier = 0
                attrList.spendwp = 0
                attrList.specialty = 0
                v.rerolldice = "10"
                v.rollmodifier = 0
                v.spendwp = 0
                v.specialty = 0
                const diff = prevRArray.filter(function(x) {return rarray.indexOf(x) < 0})
                diff.forEach(function(x) {
                    const flagname = `${x }_flag`
                    attrList[flagname] = 0
                })
                // setAttrs(cleanup);
            } else if (isClearingFlags) {
                attrList.rerolldice = "10"
                attrList.rollmodifier = 0
                attrList.spendwp = 0
                attrList.specialty = 0
                v.rerolldice = "10"
                v.rollmodifier = 0
                v.spendwp = 0
                v.specialty = 0
            }
            const final = parseInt(v[statFlag], 10) === 0 || type === "rolltype" ? prevRArray.join(",") : rarray.join(","),
                order = []
            rarray.filter(function(x){return attributes.indexOf(x) > -1}).forEach(function(x) {order.push(x)})
            rarray.filter(function(x){return skills.indexOf(x) > -1}).forEach(function(x) {order.push(x)})
            if (rarray.indexOf("potency") > -1) order.push("potency")
            rarray.filter(function(x){return normalStats.indexOf(x) === -1 && x != "potency"}).forEach(function(x) {order.push(x)})

            const names = order.map(function(x) {
                    const transX = getTranslationByKey(x)
                    if (x == "potency")
                        return v.potency_name// may need to do getTranslationgByKey here as well, but not sure what the potential values of this are, and if they are user defined or sheet defined
                    return transX.charAt(0).toUpperCase() + transX.slice(1)// note I actually prefer to do this using .replace if there's going to be a chance for multi word casing
                }),
                rollerNames = [...names]
            
            consoleLines.push(...[
                "====== PRELIM RARRAY/ORDER/NAMES =======",
                `RARRAY: ${rarray.join(", ")}`,
                `ORDER: ${order.join(", ")}`,
                `NAMES: ${names.join(", ")}`,
                " "
            ])            
            const formatDisplay = (orderNum, base) => {  
                    const traitRef = order[orderNum],
                        traitVal = parseInt(v[traitRef]) || 0,
                        traitName = names[orderNum],
                        partNum = orderNum + 1   
                    if (orderNum == 1 && parseInt(v.specialty) > 0)
                        base = `${base} {{part${partNum}=<div class="specialty">+ ${traitName}}} {{part${partNum}pool=${traitVal}}} {{part${partNum}pooldisplay=(${traitVal} + 1)</div>}}`
                    else if (skills.includes(traitRef) && traitVal < 0) 
                        base = `${base} {{part${partNum}=+ ${traitName}}} {{part${partNum}pool=${traitVal}}} {{part${partNum}pooldisplay=(0)</div><div class="simplenumber redtext">- Untrained (${Math.abs(traitVal)})</div>}}`
                    else 
                    if (traitVal < 0)
                        base = `${base} {{part${partNum}=<div class="simplenumber redtext">- ${traitName}}} {{part${partNum}pool=${traitVal}}} {{part${partNum}pooldisplay=(${Math.abs(traitVal)})</div>}}`
                    else
                        base = `${base} {{part${partNum}=+ ${traitName}}} {{part${partNum}pool=${traitVal}}} {{part${partNum}pooldisplay=(${Math.abs(traitVal)})}}`
                
                    return base
                },            
                manualRollMod = parseInt(v.rollmodifier) || 0,
                woundPenalty = parseInt(v.wound_penalty) || 0,
                armorPenalty = parseInt(v.armor_penalty) || 0,
                weaponPenalty = parseInt(v.weapon_penalty) || 0,
                targetDefense = parseInt(v.target_defense) || 0,
                extraDisplayParts = [],
                extraAttackDisplayParts = []

            let rollBase = "&{template:wod-simple} {{name=@{character_name}}} {{option=?{@{dicepoolmacro} || 0}}} {{result=[[{(?{@{dicepoolmacro}|1}@{rolltype}",
                result = "",
                rollType = v.rolltype,
                rollTypeAttack = v.rolltypeattack,dicePool = 0,
                extraDice = 0,
                extraAttackDice = 0,
                attackDicePool = 0
                

            if (parseInt(v.specialty) > 0) {
                dicePool += 1
                extraDice += 1
                attackDicePool += 1
                extraAttackDice += 1
                for (let i = 0; i < names.length; i++) 
                    if (skills.includes(names[i].toLowerCase())) {
                        names[i] += "ˢᵖᵉᶜꜛ"
                        rollerNames[i] += "ꜛ"
                        break
                    }
                
            }
            if (parseInt(v.spendwp) > 0) {
                dicePool += 3
                extraDice += 3
                attackDicePool += 3
                extraAttackDice += 3
                extraDisplayParts.push("+ 3ʷᵖ")
                extraAttackDisplayParts.push("+ 3ʷᵖ")
                rollType += " {{extramodline=@{extrarollmoddisplay}}}"
                rollTypeAttack += " {{extramodline=@{extrarollmoddisplay}}}"
                attrList.extrarollmoddisplay = "+ Willpower (3)"
            }
            if (manualRollMod !== 0) {
                dicePool += manualRollMod
                attackDicePool += manualRollMod
                extraDisplayParts.push(`${manualRollMod < 0 ? "-" : "+"} ${Math.abs(manualRollMod)}`)
                extraAttackDisplayParts.push(`${manualRollMod < 0 ? "-" : "+"} ${Math.abs(manualRollMod)}`)
            }
            if (woundPenalty !== 0) {
                dicePool += woundPenalty
                attackDicePool += woundPenalty
                extraDisplayParts.push(`-💔${superScripts[Math.abs(woundPenalty)]}`)
                extraAttackDisplayParts.push(`-💔${superScripts[Math.abs(woundPenalty)]}`)
            }
            if (armorPenalty !== 0) {
                attackDicePool += armorPenalty
                extraAttackDisplayParts.push(`- ${Math.abs(armorPenalty)}ᵃʳᵐ`)                
            }
            if (weaponPenalty !== 0) {
                attackDicePool += weaponPenalty
                extraAttackDisplayParts.push(`- ${Math.abs(weaponPenalty)}ˢᵗʳ`)
            }
            attackDicePool -= targetDefense
            rollType = `+${extraDice}${rollType}`
            rollTypeAttack = `+${extraAttackDice}${rollTypeAttack}`
            
            if(order.length > 0) {
                rollBase = `&{template:wod-3part} {{name=@{character_name}}} {{mod=[[@{rollmodifier}]]}} {{moddisplay=${ Math.abs(parseInt(v.rollmodifier) || 0) }}} {{woundpenaltydisplay=[[@{woundpenaltydisplay}]]}} {{woundpenalty=[[@{wound_penalty}]]}} {{part1=${ names[0] }}} {{part1pool=${ v[order[0]] }}} {{part1pooldisplay=(${ v[order[0]] })}}`
                result = ` {{result=[[{((@{rollmodifier}+@{wound_penalty}+${ v[order[0]]}`
                dicePool += parseInt(v[order[0]])
                for (let i = 1; i < order.length; i++) {
                    rollBase = formatDisplay(i, rollBase)
                    result = `${result}+${v[order[i]]}`
                    dicePool += parseInt(v[order[i]]) || 0                    
                }
            }

            if (dicePool <= 0) 
                rollBase += ` {{result=${chanceResult}}} {{chance=[[1]]}}`
            else 
                rollBase += ` {{dicepool=${dicePool}}}${result})${rollType} {{chance=[[0]]}}`
            

            consoleLines.push(...[
                "====== ROLL TEMPLATE CALLS: ======",
                `RESULT: ${result}`,
                `BASE: ${rollBase}`,
                `DICE POOL: ${dicePool}`,
                " "
            ])
            const display = ""
            let displayBase = "",
                attackSkillDisplay = "",
                displayAttack = "",
                displayAttackStart = ""

            if (order.length === 0)
                displayBase = `${display}${getTranslationByKey("simple-roll")}\n`
            else
                displayBase = rollerNames.join(" + ")
            
            
            if (extraDisplayParts.length)
                displayBase += ` ${extraDisplayParts.join(" ")}`

            if (displayBase.length > 35) {
                displayBase = displayBase.split(" ")
                displayBase[0] = `${displayBase[0].slice(0,3) }.`
                displayBase = displayBase.join(" ")
                if (displayBase.length > 35) {
                    displayBase = displayBase.split(" ")
                    displayBase[2] = `${displayBase[2].slice(0,3) }.`
                    displayBase = displayBase.join(" ")
                }
            }
            
            const regex = /attack_type(.)/,
                attackNum = v.attack.match(regex)[1],
                attackName = v[`attack_name${attackNum}`],
                attackType = `attack_type${attackNum}`,
                attackDamage = parseInt(v[`attack_damage${attackNum}`]) || 0,
                attackTerms = []
            if(v[attackType].indexOf("str=1") > -1) {
                attackTerms.push(getTranslationByKey("strength"))
                attackDicePool += parseInt(v.strength) || 0
            }
            if(v[attackType].indexOf("dex=1") > -1) {
                attackTerms.push(getTranslationByKey("dexterity"))
                attackDicePool += parseInt(v.dexterity) || 0
            }
            if(v[attackType].indexOf("bra=1") > -1) {
                attackTerms.push(getTranslationByKey("brawl"))
                attackDicePool += parseInt(v.brawl) || 0
            }
            if(v[attackType].indexOf("wea=1") > -1) {
                attackTerms.push(getTranslationByKey("weaponry"))
                attackDicePool += parseInt(v.weaponry) || 0
            }
            if(v[attackType].indexOf("fir=1") > -1) {
                attackTerms.push(getTranslationByKey("firearms"))
                attackDicePool += parseInt(v.firearms) || 0
                attackDicePool += targetDefense
            }
            if(v[attackType].indexOf("ath=1") > -1) {
                attackTerms.push(getTranslationByKey("athletics"))
                attackDicePool += parseInt(v.athletics) || 0
            }

            consoleLines.push(...[
                "====== ATTACK TERMS: ======",
                `Attack Terms: ${JSON.stringify(attackTerms)}`,
                `Attack Pool: ${attackDicePool}`,
                `Roll Attack Type: ${rollTypeAttack}`,
                " "
            ])

            if (attackDicePool <= 0) 
                rollTypeAttack += " {{chance=[[1]]}}"
            else 
                rollTypeAttack += ` {{dicepool=${attackDicePool}}} {{chance=[[0]]}}`
            



            for (let i = 0; i < attackTerms.length; i++) 
                if (skills.includes(attackTerms[i].toLowerCase())) {
                    const traitVal = parseInt(v[attackTerms[i].toLowerCase()]) || 0
                    if (parseInt(v[attackTerms[i].toLowerCase()]) <= 0) {
                        attackSkillDisplay = `+ ${attackTerms[i]} (0)</div><div class="simplenumber redtext">- Untrained (1)</div>`
                    } else if (parseInt(v.specialty) > 0) {
                        attackSkillDisplay = `<div class="specialty">+ ${attackTerms[i]}ˢᵖᵉᶜꜛ (${traitVal} + 1)</div>`
                        attackTerms[i] += "ꜛ"
                    } else {
                        attackSkillDisplay = `+ ${attackTerms[i]} (${traitVal})`
                    }
                    break
                }                
            

            displayAttack = `${attackTerms.join(" + ") } ${ extraAttackDisplayParts.join(" ")}`
                        
            if (displayAttack.length > 30) {
                displayAttack = displayAttack.split(" ")
                displayAttack[0] = `${displayAttack[0].slice(0,3) }.`
                displayAttack = displayAttack.join(" ")
                if (displayAttack.length > 30) {
                    displayAttack = displayAttack.split(" ")
                    displayAttack[2] = `${displayAttack[2].slice(0,3) }.`
                    displayAttack = displayAttack.join(" ")
                }
            }
            if (attackNum == 0) 
                displayAttackStart = "Unarmed\nAttack"
            else 
                displayAttackStart = `${attackName}\nAttack`
            

            consoleLines.push(...[
                "====== DISPLAYS: ======",
                `BASE: ${displayBase}`,
                `ATK START: ${displayAttackStart.replace(/\n/gu, "\\n")}`,
                `ATTACK: ${displayAttack}`,
                `DICE POOL: ${dicePool}`,
                `ROLL ATTACK TYPE: ${rollTypeAttack}`,
                " "
            ])




            /*

            if(v.rollstyle === "@{roll_base}" || v.rollstyle === "@{roll_nomods}") {
                if(order.length === 0) {
                    display = `${display}${getTranslationByKey("simple-roll")}\n`
                }
                else {
                    //display = order.join(" +\n");
                    //display = display.replace(/\b./g, function(x){ return x.toUpperCase(); });
                    display = names.join(" +\n");
                }
            }
            else if(v.rollstyle === "@{rollattack}") {
                var regex = /attack_type(.)/;
                var attack_type = "attack_type" + v.attack.match(regex)[1];
                if(v[attack_type].indexOf("str=1") > -1) {
                    display = `${display}${getTranslationByKey("strength")}\n`
                }
                if(v[attack_type].indexOf("dex=1") > -1) {
                    display = `${display}${getTranslationByKey("dexterity")}\n`
                }
                if(v[attack_type].indexOf("bra=1") > -1) {
                    display = `${display}${getTranslationByKey("brawl")}\n`
                }
                if(v[attack_type].indexOf("wea=1") > -1) {
                    display = `${display}${getTranslationByKey("weaponry")}\n`
                }
                if(v[attack_type].indexOf("fir=1") > -1) {
                    display = `${display}${getTranslationByKey("firearms")}\n`
                }
                if(v[attack_type].indexOf("ath=1") > -1) {
                    display = `${display}${getTranslationByKey("athletics")}\n`
                }
            }
            else if(v.rollstyle === "@{rollsimple}") {
                display = `${display}${getTranslationByKey("simple-roll")}\n`
            }
            */

            attrList = Object.assign(attrList, {                
                roll_array: final,
                roll_base: rollBase,
                rollmodifiersign: manualRollMod > 0 ? "+" : "",
                rolldisplay_base: displayBase,
                rolldisplay_attack: displayAttack,
                rolldisplay_attack_start: displayAttackStart,
                rolldisplay_attack_damage: `${attackDamage >= 0 ? "+" : "-"}${Math.abs(attackDamage)}`,
                rolldisplay_ischance: dicePool <= 0 ? 1 : 0,
                rolldisplay_isattackchance: attackDicePool <= 0 ? 1 : 0,
                rolldisplay: display,
                dicepooldisplay: dicePool <= 0 ? "©" : dicePool,
                attackpooldisplay: attackDicePool <= 0 ? "©" : attackDicePool,
                woundpenaltydisplay: Math.abs(v.wound_penalty),
                moddisplay: Math.abs(parseInt(v.rollmodifier) || 0),
                attackskilldisplay: attackSkillDisplay,
                rolltypeattack: rollTypeAttack
            })
            
            for (const [name, val] of Object.entries(attrList))
                consoleLines.push(` U: ${name.toUpperCase()}: ${typeof val === "string" ? `"${val}"` : val}`)

            consoleLines = consoleLines.map(x => `%-UR-% ${x}`)
            consoleLines.unshift(...[
                " ",
                " ",
                "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
                `%%%%%% UPDATE ROLLS (${stat}): ATTRIBUTES PASSED... %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%`,
                "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
            ])
            consoleLines.push(...[
                "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
                " ",
                " "
            ])
            // console.log(consoleLines.join("\n"))

            setAttrs(attrList)
        })
    },

    updateHealth = function() {
        getAttrs(["stamina","base_size","giant","small_framed","sheettype","resilience","bonus_health"], function(v) {
            let health = parseInt(v.stamina, 10) + parseInt(v.base_size, 10) + parseInt(v.giant, 10) + parseInt(v.small_framed, 10) + parseInt(v.bonus_health, 10)
            if(v.sheettype.indexOf("vampire2")) 
                health += parseInt(v.resilience, 10)
            
            setAttrs({
                health
            })
        })
    },

    updateWillpower = function() {
        getAttrs(["resolve","composure","bonus_willpower"], function(v) {
            const willpower = parseInt(v.resolve, 10) + parseInt(v.composure, 10) + parseInt(v.bonus_willpower, 10)
            setAttrs({
                willpower
            })
        })
    },

    updateMoralHealth = function() {
        getAttrs(["wits","composure","bonus_moralhealth","sheettype"], function(v) {
            if (v.sheettype == "changeling2"){
                const moralhealth = parseInt(v.wits, 10) + parseInt(v.composure, 10) + parseInt(v.bonus_moralhealth)
                setAttrs({
                    moralhealth
                })
            }
        })
    },

    updateAttacks = function() {
        getAttrs(["strength","attack","iron_stamina","attack_initiative0","attack_initiative1","attack_initiative2","attack_initiative3","attack_initiative4","attack_strength0","attack_strength1","attack_strength2","attack_strength3","attack_strength4","armor_flag0","armor_flag1","armor_flag2","armor_strength0","armor_strength1","armor_strength2","health","healthbox_1","healthbox_2","healthbox_3","healthbox_4","healthbox_5","healthbox_6","healthbox_7","healthbox_8","healthbox_9","healthbox_10","healthbox_11","healthbox_12","healthbox_13","healthbox_14","healthbox_15","healthbox_16"], function(v) {
            const str = parseInt(v.strength, 10),
                regex = /attack_type(.)/,
                atknum = v.attack.match(regex)[1],
                init = isNaN(v[`attack_initiative${ atknum}`]) === false && v[`attack_initiative${ atknum}`] != "" ? v[`attack_initiative${ atknum}`] : 0,                
                wpen = str < v[`attack_strength${ atknum}`] ? str - v[`attack_strength${ atknum}`] : 0,
                ironStamina = parseInt(v.iron_stamina, 10)
            let apen = 0,
                woundPenalty = 0
            // console.log(`******** INIT PENALTY: ${init} ***********`)
            if(v.armor_flag0 != 0 && str < parseInt(v.armor_strength0)) apen += str - parseInt(v.armor_strength0)
            if(v.armor_flag1 != 0 && str < parseInt(v.armor_strength1)) apen += str - parseInt(v.armor_strength1)
            if(v.armor_flag2 != 0 && str < parseInt(v.armor_strength2)) apen += str - parseInt(v.armor_strength2)
                
            if(v[`healthbox_${ v.health}`] != 0) 
                woundPenalty = -3 + Math.min(ironStamina, 3)
            
            else if(v[`healthbox_${ v.health - 1}`] != 0) 
                woundPenalty = -2 + Math.min(ironStamina, 2)
            
            else if(v[`healthbox_${ v.health - 2}`] != 0) 
                woundPenalty = -1 + Math.min(ironStamina, 1)
            
            setAttrs({
                weapon_penalty: wpen,
                wpendisplay: Math.abs(parseInt(wpen) || 0),
                armor_penalty: apen,
                apendisplay: Math.abs(parseInt(apen) || 0),
                initiative_penalty: init,
                initiativepenaltydisplay: Math.abs(parseInt(init) || 0),
                wound_penalty: woundPenalty,
                woundpenaltydisplay: Math.abs(parseInt(woundPenalty) || 0)
            })
        })
    },

    updateDefense = function(defenseType = "lowest") {
        getAttrs(["athletics","brawl","dexterity","weaponry","wits"], function(v) {
            const athletics = parseInt(v.athletics, 10) || 0,
                brawl = parseInt(v.brawl, 10) || 10, // PRD-1407
                dexterity = parseInt(v.dexterity, 10) || 0,
                weaponry = parseInt(v.weaponry, 10) || 10, // PRD-1407
                wits = parseInt(v.wits, 10) || 10
            let defense
            switch (defenseType) {
                case "lowest":
                    defense = Math.min(dexterity, wits)
                    break
                case "highest":
                    defense = Math.max(dexterity, wits)
                    break
                case "wits":
                    defense = wits
                    break
                case "dexterity":
                    defense = dexterity
                    break
                case "lowest_plus_athletics":
                    defense = Math.min(dexterity, wits) + athletics
                    break
                case "lowest_plus_brawl":
                    defense = Math.min(dexterity, wits) + brawl
                    break
                case "lowest_plus_weaponry":
                    defense = Math.min(dexterity, wits) + weaponry
                    break
                // no default
            }
            setAttrs({defense_base: defense})
        })
    },

    updateDefaultDefense = function() {
        getAttrs(["sheettype"], function(v) {
            let defense
            if (v.sheettype === "mortal2" ||
                v.sheettype === "vampire2" ||
                v.sheettype === "werewolf2" ||
                v.sheettype === "mage2" ||
                v.sheettype === "promethean2" ||
                v.sheettype === "changeling2" ||
                v.sheettype === "demon" ||
                v.sheettype === "beast" ||
                v.sheettype === "hunter2") 
                defense = "lowest_plus_athletics"
            
            else 
                defense = "lowest"
            
            setAttrs({defense_select: defense})
        })
    },

    updateWoundPenalties = function() {
        getAttrs(["iron_stamina"], function(v) {
            const ironStamina = parseInt(v.iron_stamina, 10),
                setWound = {}
            let woundpenalties = "-1-2-3"
            if (ironStamina >= 3) 
                woundpenalties = ""
            
            else if (ironStamina === 2) 
                woundpenalties = "-1"
            
            else if (ironStamina === 1) 
                woundpenalties = "-1-2";
            
            [...Array(16).keys()].forEach(num => {
                setWound[`woundpenalties_${num+1}`]= woundpenalties
            })
            setAttrs(setWound)
        })
    },

    updatePotencyName = function() {
        getAttrs(["sheettype"], function(v){
            setAttrs({
                potency_name: potencyNames[v.sheettype]
            })
        })
    }
