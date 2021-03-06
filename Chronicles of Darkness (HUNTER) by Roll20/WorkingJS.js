
    var attributes = ["intelligence","wits","resolve","strength","dexterity","stamina","presence","manipulation","composure"];
    var skills = ["academics","computer","crafts","investigation","medicine","occult","politics","science","athletics","brawl","drive","firearms","larceny","stealth","survival","weaponry","animalken","empathy","expression","intimidation","persuasion","socialize","streetwise","subterfuge"];
    var catskills = {
        mental: skills.slice(0, 8),
        physical: skills.slice(8, 16),
        social: skills.slice(16)
    }
    var normalStats = ["intelligence","wits","resolve","strength","dexterity","stamina","presence","manipulation","composure","academics","computer","crafts","investigation","medicine","occult","politics","science","athletics","brawl","drive","firearms","larceny","stealth","survival","weaponry","animalken","empathy","expression","intimidation","persuasion","socialize","streetwise","subterfuge"];
    var powers = ["animalism","auspex","celerity","dominate","majesty","nightmare","obfuscate","protean","resilience","vigor","crúac","thebansorcery","death","fate","forces","life","matter","mind","prime","spirit","space","time"];
    var allStats = ["intelligence","wits","resolve","strength","dexterity","stamina","presence","manipulation","composure","academics","computer","crafts","investigation","medicine","occult","politics","science","athletics","brawl","drive","firearms","larceny","stealth","survival","weaponry","animalken","empathy","expression","intimidation","persuasion","socialize","streetwise","subterfuge","animalism","auspex","celerity","dominate","majesty","nightmare","obfuscate","protean","resilience","vigor","crúac","thebansorcery","death","fate","forces","life","matter","mind","prime","spirit","space","time","potency"];
    var potencyNames = { mortal1:"", mortal2:"", vampire1:"Blood Potency", vampire2:"Blood Potency", werewolf1:"Primal Urge", werewolf2:"Primal Urge", mage1:"Gnosis", mage2:"Gnosis", promethean1:"Azoth", promethean2:"Azoth", changeling1:"Wyrd", changeling2:"Wyrd", demon:"Primum", beast:"Lair", hunter:"", geist1:"Psyche", mummy1:"Sekhem", hunter2:"" };
    var superScripts = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"];
    var rollflags = {
        "!cs>10": "",
        "cs>10": " {{isnoreroll=1}}",
        "!>9cs>9": " {{is9again=1}}",
        "!>8cs>8": " {{is8again=1}}",
        "ro<7": " {{isrote=1}}"
    };
    ["intelligence","wits","resolve","strength","dexterity","stamina","presence","manipulation","composure","academics","computer","crafts","investigation","medicine","occult","politics","science","athletics","brawl","drive","firearms","larceny","stealth","survival","weaponry","animalken","empathy","expression","intimidation","persuasion","socialize","streetwise","subterfuge","animalism","auspex","celerity","dominate","majesty","nightmare","obfuscate","protean","resilience","vigor","crúac","thebansorcery","death","fate","forces","life","matter","mind","prime","spirit","space","time","potency"].forEach((attr) => {
        on(`change:${attr} change:${attr}_flag`, (eventInfo) => {
            const source = eventInfo.sourceAttribute;
            const attribute = (attr.includes("flag")) ? attr.split(`_flag`)[0] : attr; //Remove the "_flag" part so we can pass the name
            updateRollTraits(`${attribute}`)

            // if (!eventInfo.sourceAttribute.endsWith("_flag") || "previousValue" in eventInfo) {
            //     console.log(`==== Ch:Trait/Flag: ${eventInfo.sourceType} ==== updateRolls('${attribute}'):\n${JSON.stringify(eventInfo)}`)
                updateRolls(`${attribute}`);
            // }

            if (source === "resolve_flag" || source === "composure_flag") {
                updateWillpower();
            };

            if (source === "wits" || source === "composure") {
                updateMoralHealth();
            };

            if (source === "wits" || source === "dexterity" || source === "athletics" || source === "brawl" || source === "weaponry") {
                getAttrs(["defense_select"], (v) => { // PRD-1407
                    updateDefense(v.defense_select);
                });
            };

            if (source === "stamina" || source === "resilience") {
                updateHealth();
            };
        });
    });

    [...Array(5).keys()].forEach((attr) => {
        on(`change:attack_type${attr}`, (eventInfo) => {//checks attack_type0 trough attack_type4
            if (true /*eventInfo.sourceType != "sheetworker"*/) {
                console.log(`==== Ch:ATTACK_TYPE: ${eventInfo.sourceType} ==== updateRolls('rolltype'):\n${JSON.stringify(eventInfo)}`)
                updateRolls("rolltype");
            }
        });
    });

    on("change:attack", function(eventInfo) {
        if (true /*eventInfo.sourceType != "sheetworker"*/) {
            console.log(`==== Ch:ATTACK: ${eventInfo.sourceType} ==== updateRolls('rolltype'):\n${JSON.stringify(eventInfo)}`)
            updateRolls("rolltype", "previousValue" in eventInfo);
            updateAttacks();
        }
    });

    ["_initiative0","_initiative1","_initiative2","_initiative3","_initiative4","_strength0","_strength1","_strength2","_strength3","_strength4"].forEach((attr) => {
      on(`change:attack${attr}`, (eventInfo) => {
          updateAttacks();
      });
    });

    ["","_flag0","_flag1","_flag2","_strength0","_strength1","_strength2"].forEach((attr) => {
      on(`change:armor${attr}`, (eventInfo) => {
          updateAttacks();
      });
    });

    on("change:health", function() {
        updateAttacks();
    });

    [...Array(16).keys()].forEach((attr) => {//healthbox nr. 1 through 16
        on(`change:healthbox_${attr+1}`, (eventInfo) => {
          const source = eventInfo.sourceAttribute;
          console.log(source);
          updateAttacks();
        });
    });

    on("change:base_size change:giant change:small_framed change:bonus_health", function() {
        updateHealth();
    });

    on("change:sheettype", function(eventInfo) {
        if (true /*eventInfo.sourceType != "sheetworker"*/) {
            updateHealth();
            updateDefaultDefense();
            updatePotencyName();
            console.log(`==== Ch:SHEETTYPE: ${eventInfo.sourceType} ==== updateRollType():\n${JSON.stringify(eventInfo)}`)
            updateRollType();
        }
    });

    on("change:bonus_willpower", function() {
        updateWillpower();
    });

    on("change:bonus_moralhealth", function() {
        updateMoralHealth();
    });

    on("change:defense_select", function(eventInfo) {
        updateDefense(eventInfo.newValue);
    });

    on("change:iron_stamina", function() {
        updateWoundPenalties();
    });

    on("change:rolltype_select change:rerolldice change:spendwp change:specialty", function(eventInfo) {
        if (!(eventInfo.sourceAttribute === "rerolldice" && eventInfo.newValue == "-1")) {
            console.log(`==== Ch:ROLL FLAGS: ${eventInfo.sourceType} ==== updateRollType():\n${JSON.stringify(eventInfo)}`)
            updateRollType();
        }
    });

    on("change:rollmodifier change:rerolldice change:spendwp change:specialty change:rolltype", function(eventInfo) {
        if (true /*eventInfo.sourceType != "sheetworker"*/) {
            console.log(`==== Ch:ROLLMOD: ${eventInfo.sourceType} ==== updateRolls('rolltype'):\n${JSON.stringify(eventInfo)}`)
            updateRolls("rolltype", eventInfo.sourceAttribute === "rerolldice" && eventInfo.newValue == "-1")
        }
    })

    on("sheet:opened", function() {
        updateDefaultDefense();
        updatePotencyName();
        updateRollType();
    });
// ---------------------------------- Translation functions ------------------------------------------
    on("sheet:opened", function(){
        setAttrs({
            dicepoolmacro: getTranslationByKey("dice-pool"),
            modifiermacro: getTranslationByKey("modifiers"),
            unarmedmacro: getTranslationByKey("unarmed")
        });
    });

// --------------------------------------------------------------------------------------------------
    var updateRolls = function(stat, isClearingFlags = false, isChangingModifier = false) {
        var type;
        var stat_flag = stat + "_flag";
        var rarray = [];

        getAttrs(["rolltype", "rolltypeattack", "rollattack", "rerolldice", "attack", "target_defense", "spendwp", "specialty", "wound_penalty", "weapon_penalty", "armor_penalty", "rollstyle","rollmodifier","roll_array","attack_name0","attack_name1","attack_name2","attack_name3","attack_name4","attack_damage0","attack_damage1","attack_damage2","attack_damage3","attack_damage4","attack_type0","attack_type1","attack_type2","attack_type3","attack_type4","intelligence_flag","wits_flag","resolve_flag","strength_flag","dexterity_flag","stamina_flag","presence_flag","manipulation_flag","composure_flag","academics_flag","computer_flag","crafts_flag","investigation_flag","medicine_flag","occult_flag","politics_flag","science_flag","athletics_flag","brawl_flag","drive_flag","firearms_flag","larceny_flag","stealth_flag","survival_flag","weaponry_flag","animalken_flag","empathy_flag","expression_flag","intimidation_flag","persuasion_flag","socialize_flag","streetwise_flag","subterfuge_flag","intelligence","wits","resolve","strength","dexterity","stamina","presence","manipulation","composure","academics","computer","crafts","investigation","medicine","occult","politics","science","athletics","brawl","drive","firearms","larceny","stealth","survival","weaponry","animalken","empathy","expression","intimidation","persuasion","socialize","streetwise","subterfuge","animalism","animalism_flag","auspex","auspex_flag","celerity","celerity_flag","dominate","dominate_flag","majesty","majesty_flag","nightmare","nightmare_flag","obfuscate","obfuscate_flag","protean","protean_flag","resilience","resilience_flag","vigor","vigor_flag","crúac","crúac_flag","thebansorcery","thebansorcery_flag","death","death_flag","fate","fate_flag","forces","forces_flag","life","life_flag","matter","matter_flag","mind","mind_flag","prime","prime_flag","spirit","spirit_flag","space","space_flag","time","time_flag","potency","potency_flag","potency_name"], function(v) {
            allStats.forEach(function(x) {
                var flagname = x + "_flag";
                if(parseInt(v[flagname], 10) != 0) {
                    rarray.push(x);
                }
            });
            var prev_rarray = v.roll_array && v.roll_array != "" ? v.roll_array.split(",") : [];
            var consoleLines = [`====== UPDATE ROLLS (${stat}): ATTRIBUTES PASSED... =======`]
            for (const [name, val] of Object.entries(v))
                if (`${val}` !== "0" && val && !normalStats.includes(name.toLowerCase()))
                    consoleLines.push(`${name.toUpperCase()}: ${typeof val === "string" ? `"${val}"` : val}`)
            consoleLines.push(" ")
            if(stat != "rolltype") {
                if(parseInt(v[stat_flag], 10) === 0) {
                    if(rarray.indexOf(stat) > -1) {
                        rarray.splice(rarray.indexOf(stat), 1);
                    }
                }
                else if (stat != "potency") {
                    if(attributes.indexOf(stat) > -1) {
                        type = "attribute";
                    }
                    else if(skills.indexOf(stat) > -1) {
                        type = "skill";
                    }
                    else {
                        type = "power";
                    }
                    if(type === "attribute") {
                        if(rarray.filter(function(x){return attributes.indexOf(x) > -1}).length > 1) {
                            rarray = [stat, prev_rarray.filter(function(x){return attributes.indexOf(x) > -1})[0]];
                        }
                    }
                    if(type === "skill") {
                       const attrFilter = rarray.filter(function(x){return attributes.indexOf(x) > -1}),
                           skillFilter = rarray.filter(function(x){return skills.indexOf(x) > -1});
                       if(attrFilter.length < 2 && skillFilter.length === 0) {
                           rarray.unshift(stat);
                       }else if(attrFilter.length < 2 && skillFilter.length > 0) {
                           rarray = rarray.filter(function(x) {return skills.indexOf(x) < 0;});
                           rarray.unshift(stat);
                       }else if(attrFilter.length > 1) {
                           rarray = [stat, prev_rarray.filter(function(x){return attributes.indexOf(x) > -1})[0]];//This could probably be done with .shift instead of the filter, but I don't know what's going on the grand scheme of things so...
                       }
                    }
                    if(type === "power") {
                        if(rarray.filter(function(x){return normalStats.indexOf(x) === -1}).length > 0) {
                            rarray = rarray.filter(function(x){return normalStats.indexOf(x) > -1});
                            rarray.unshift(stat);
                        }
                        else {
                            rarray.unshift(stat);
                        }
                    }
                }
                if(rarray.length > 3) {
                    rarray.length = 3;
                }
                var cleanup = {
                        rerolldice: "10",
                        rollmodifier: 0,
                        spendwp: 0,
                        specialty: 0
                    };
                var diff = prev_rarray.filter(function(x) {return rarray.indexOf(x) < 0});
                diff.forEach(function(x) {
                    var flagname = x + "_flag";
                    cleanup[flagname] = 0;
                });
                setAttrs(cleanup);
            } else if (isClearingFlags) {
                setAttrs({
                    rerolldice: "10",
                    rollmodifier: 0,
                    spendwp: 0,
                    specialty: 0
                });
            }
            var final = parseInt(v[stat_flag], 10) === 0 || type === "rolltype" ? prev_rarray.join(",") : rarray.join(",");
            var order = [];
            rarray.filter(function(x){return attributes.indexOf(x) > -1}).forEach(function(x) {order.push(x);});
            rarray.filter(function(x){return skills.indexOf(x) > -1}).forEach(function(x) {order.push(x);});
            if (rarray.indexOf("potency") > -1) {order.push("potency");}
            rarray.filter(function(x){return normalStats.indexOf(x) === -1 && x != "potency"}).forEach(function(x) {order.push(x);});

            var names = order.map(function(x) {
               let transX = getTranslationByKey(x);
               if (x == "potency")
                   return v.potency_name;//may need to do getTranslationgByKey here as well, but not sure what the potential values of this are, and if they are user defined or sheet defined
               return transX.charAt(0).toUpperCase() + transX.slice(1);//note I actually prefer to do this using .replace if there's going to be a chance for multi word casing
            });
            
            consoleLines.push(...[
                "====== RARRAY: ======",
                rarray.join(", "),
                " ",
                "====== ORDER: ======",
                order.join(", "),
                " ",
                "====== NAMES: ======",
                names.join(", "),
            ])            
            var formatDisplay = (orderNum, base) => {  
                var traitRef = order[orderNum];
                var traitVal = parseInt(v[traitRef])|0;
                var traitName = names[orderNum];
                var partNum = orderNum + 1;   
                if (orderNum == 1 && parseInt(v["specialty"])|0 > 0)
                    base = `${base} {{part${partNum}=<div class="specialty">+ ${traitName}}} {{part${partNum}pool=${traitVal}}} {{part${partNum}pooldisplay=(${traitVal} + 1)</div>}}`;
                else if (skills.includes(traitRef) && traitVal < 0) {
                    base = `${base} {{part${partNum}=+ ${traitName}}} {{part${partNum}pool=${traitVal}}} {{part${partNum}pooldisplay=(0)</div><div class="simplenumber redtext">- Untrained (${Math.abs(traitVal)})</div>}}`;
                } else {
                    if (traitVal < 0)
                        base = `${base} {{part${partNum}=<div class="simplenumber redtext">- ${traitName}}} {{part${partNum}pool=${traitVal}}} {{part${partNum}pooldisplay=(${Math.abs(traitVal)})</div>}}`;
                    else
                        base = `${base} {{part${partNum}=+ ${traitName}}} {{part${partNum}pool=${traitVal}}} {{part${partNum}pooldisplay=(${Math.abs(traitVal)})}}`;
                }
                return base
            };   

            var base = "&{template:wod-simple} {{name=@{character_name}}} {{option=?{@{dicepoolmacro}|0}}} {{result=[[{(?{@{dicepoolmacro}|1}@{rolltype}";
            var roll_type = v["rolltype"];
            var roll_type_attack = v["rolltypeattack"];
            var result = "";
            var dicePool = 0;
            var attackDicePool = 0;
            var manualRollMod = parseInt(v["rollmodifier"]) | 0
            var woundPenalty = parseInt(v["wound_penalty"]) | 0
            var armorPenalty = parseInt(v["armor_penalty"]) | 0
            var weaponPenalty = parseInt(v["weapon_penalty"]) | 0
            var targetDefense = parseInt(v["target_defense"]) | 0
            var extraDisplayParts = [];
            var extraAttackDisplayParts = [];
            if (parseInt(v["specialty"])|0 > 0) {
                dicePool += 1;
                attackDicePool += 1;
                for (let i = 0; i < names.length; i++) {
                    if (skills.includes(names[i].toLowerCase())) {
                        names[i] += "ꜛ"
                        break
                    }
                }
            }
            if (parseInt(v["spendwp"])|0 > 0) {
                dicePool += 3;
                attackDicePool += 3;
                extraDisplayParts.push("+ 3ʷᵖ");
                extraAttackDisplayParts.push("+ 3ʷᵖ");
            }
            if (manualRollMod !== 0) {
                dicePool += manualRollMod
                attackDicePool += 3;
                extraDisplayParts.push(`${manualRollMod < 0 ? "-" : "+"} ${Math.abs(manualRollMod)}`)
                extraAttackDisplayParts.push(`${manualRollMod < 0 ? "-" : "+"} ${Math.abs(manualRollMod)}`)
            }
            if (woundPenalty !== 0) {
                dicePool += woundPenalty
                attackDicePool += woundPenalty
                extraDisplayParts.push(`-💔${superScripts[Math.abs(woundPenalty)]}`);
                extraAttackDisplayParts.push(`-💔${superScripts[Math.abs(woundPenalty)]}`);
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


            
            if(order.length > 0) {
                base = "&{template:wod-3part} {{name=@{character_name}}} {{mod=[[@{rollmodifier}]]}} {{moddisplay=" + Math.abs(parseInt(v["rollmodifier"])|0) + "}} {{woundpenaltydisplay=[[@{woundpenaltydisplay}]]}} {{woundpenalty=[[@{wound_penalty}]]}} {{part1=" + names[0] + "}} {{part1pool=" + v[order[0]] + "}} {{part1pooldisplay=(" + v[order[0]] + ")}}";
                result = " {{result=[[{((@{rollmodifier}+@{wound_penalty}+" + v[order[0]];
                dicePool += parseInt(v[order[0]]);
                for (let i = 1; i < order.length; i++) {
                    base = formatDisplay(i, base);
                    result = `${result}+${v[order[i]]}`;
                    dicePool += parseInt(v[order[i]])|0;                    
                }
                if (dicePool <= 0) {
                    base = `${base} {{result=[[{1d10cf<1}>10]]}} {{chance=[[1]]}}`;
                } else {
                    base = `${base} {{dicepool=${dicePool}}}${result})${roll_type}`;
                }
            }
            consoleLines.push(...[
                " ",
                "====== ROLL TEMPLATE CALLS: ======",
                `RESULT: ${result}`,
                `BASE: ${base}`,
                `DICE POOL: ${dicePool}`,
                " "
            ])
            var display = "",
                displayBase = "",
                displayAttack = "",
                displayAttackStart = "";

            if (order.length === 0)
                displayBase = `${display}${getTranslationByKey("simple-roll")}\n`
            else
                displayBase = names.join(" + ");
            
            
            if (extraDisplayParts.length)
                displayBase += ` ${extraDisplayParts.join(" ")}`

            if (displayBase.length > 35) {
                displayBase = displayBase.split(" ")
                displayBase[0] = displayBase[0].slice(0,3) + "."
                displayBase = displayBase.join(" ")
            }
            
            var regex = /attack_type(.)/;
            var attackNum = v.attack.match(regex)[1];
            var attack_name = v[`attack_name${attackNum}`];
            var attack_type = `attack_type${attackNum}`;
            var attack_damage = parseInt(v[`attack_damage${attackNum}`])|0;
            var attackTerms = []
            if(v[attack_type].indexOf("str=1") > -1) {
                attackTerms.push(getTranslationByKey("strength"))
                attackDicePool += parseInt(v["strength"])|0
            }
            if(v[attack_type].indexOf("dex=1") > -1) {
                attackTerms.push(getTranslationByKey("dexterity"))
                attackDicePool += parseInt(v["dexterity"])|0
            }
            if(v[attack_type].indexOf("bra=1") > -1) {
                attackTerms.push(getTranslationByKey("brawl"))
                attackDicePool += parseInt(v["brawl"])|0
            }
            if(v[attack_type].indexOf("wea=1") > -1) {
                attackTerms.push(getTranslationByKey("weaponry"))
                attackDicePool += parseInt(v["weaponry"])|0
            }
            if(v[attack_type].indexOf("fir=1") > -1) {
                attackTerms.push(getTranslationByKey("firearms"))
                attackDicePool += parseInt(v["firearms"])|0
            }
            if(v[attack_type].indexOf("ath=1") > -1) {
                attackTerms.push(getTranslationByKey("athletics"))
                attackDicePool += parseInt(v["athletics"])|0
            }

            console.log(`Attack Terms: ${JSON.stringify(attackTerms)}\nAttack Pool: ${attackDicePool}\nRoll Attack Type: ${roll_type_attack}`)

            var attackSkillDisplay = ""
            for (let i = 0; i < attackTerms.length; i++) {
                if (skills.includes(attackTerms[i].toLowerCase())) {
                    var traitVal = parseInt(v[attackTerms[i].toLowerCase()])|0
                    if (parseInt(v[attackTerms[i].toLowerCase()]) <= 0) {
                        attackSkillDisplay = `+ ${attackTerms[i]} (0)</div><div class="simplenumber redtext">- Untrained (1)</div>`
                    } else if (parseInt(v["specialty"])|0 > 0) {
                        attackTerms[i] += "ꜛ"
                        attackSkillDisplay = `<div class="specialty">+ ${attackTerms[i]} (${traitVal} + 1)</div>`
                    } else {
                        attackSkillDisplay = `+ ${attackTerms[i]} (${traitVal})`
                    }
                    break
                }                
            }

            roll_type_attack = `${roll_type_attack.replace(/\s*{{chance=\[\[\d\]\]}}/g, "").replace(/\s*{{dicepool=\d*}}/g, "").replace(/\s*{{extramodline=@{extrarollmoddisplay}}}/g, "")} {{dicepool=${attackDicePool}}} {{chance=[[${attackDicePool <= 0 ? 1 : 0}]]}}`
            if (parseInt(v["spendwp"])|0 > 0)
                roll_type_attack += " {{extramodline=@{extrarollmoddisplay}}}"

            displayAttack = attackTerms.join(" + ") + " " + extraAttackDisplayParts.join(" ");
                       
            if (displayAttack.length > 30) {
                displayAttack = displayAttack.split(" ")
                displayAttack[0] = displayAttack[0].slice(0,3) + "."
                displayAttack = displayAttack.join(" ")
            }
            if (attackNum == 0) {
                displayAttackStart = "Unarmed\nAttack"
            } else {
                displayAttackStart = `${attack_name}\nAttack`
            }

            consoleLines.push(...[
                `Categorized Skills: ${JSON.stringify(catskills)}`,
                " ",
                "====== DISPLAYS: ======",
                `BASE: ${displayBase}`,
                `ATK START: ${displayAttackStart}`,
                `ATTACK: ${displayAttack}`,
                `DICE POOL: ${dicePool}`,
                `========`,
                `Roll Attack Type: ${roll_type_attack}`
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

            console.log(consoleLines.join("\n"))

            setAttrs({
                roll_array: final,
                roll_base: base,
                rollmodifiersign: manualRollMod > 0 ? "+" : "",
                rolldisplay_base: displayBase,
                rolldisplay_attack: displayAttack,
                rolldisplay_attack_start: displayAttackStart,
                rolldisplay_attack_damage: `${attack_damage >= 0 ? "+" : "-"}${Math.abs(attack_damage)}`,
                rolldisplay_ischance: dicePool <= 0 ? 1 : 0,
                rolldisplay_isattackchance: attackDicePool <= 0 ? 1 : 0,
                rolldisplay: display,
                dicepooldisplay: dicePool <= 0 ? "©" : dicePool,
                attackpooldisplay: attackDicePool <= 0 ? "©" : attackDicePool,
                woundpenaltydisplay: Math.abs(v["wound_penalty"]),
                moddisplay: Math.abs(parseInt(v["rollmodifier"])|0),
                attackskilldisplay: attackSkillDisplay,
                rolltypeattack: roll_type_attack
            });
        });
    };    

    var updateRollType = function() {
        getAttrs(["rolltype_select","rolltypeattack", "sheettype","attack_type0","attack_type1","attack_type2","attack_type3","attack_type4", "rollflag_chance", "rerolldice", "spendwp", "specialty"], function(v) {
            var consoleLines = []
            console.log(JSON.stringify(v))
            for (const [name, val] of Object.entries(v))
                consoleLines.push(`${name.toUpperCase()}: ${typeof val === "string" ? `"${val}"` : val}`)
            consoleLines.push(" ")
            var update = {
                rollsimple: "&{template:wod-simple} {{name=@{character_name}}} {{option=?{@{dicepoolmacro}|0}}} {{result=[[{(?{@{dicepoolmacro}|1}",
                rollchance: "&{template:wod-simple} {{name=@{character_name}}} {{result=[[{1d10cf<1}>10]]}} {{chance=[[1]]}}"
            };
            var isSecondEdition = v.sheettype === "mortal2" ||
                v.sheettype === "vampire2" ||
                v.sheettype === "werewolf2" ||
                v.sheettype === "mage2" ||
                v.sheettype === "promethean2" ||
                v.sheettype === "changeling2" ||
                v.sheettype === "demon" ||
                v.sheettype === "beast" ||
                v.sheettype === "hunter2";
            var templateConstructor = [],
                extraDice = 0,
                extraRollMods = [];
            if (parseInt(v.spendwp)) {
                extraDice += 3;
                extraRollMods.push("+ Willpower (3)")
            }
            if (parseInt(v.specialty)) {
                extraDice += 1;
            }
            switch (v.rerolldice) {
                case "0": {
                    update["rolltype"] = `+${extraDice})d10cs>10}>8]]}} {{noreroll=1}} {{chance=[[0]]}}`;
                    update["rolltypeattack"] = `+${extraDice})d10cs>10}>8]]}} {{noreroll=1}} {{chance=[[0]]}}`;
                    update["rollsimple"] = `${update["rollsimple"]})d10cs>10}>8]]}} {{noreroll=1}} {{chance=[[0]]}}`;
                    update["rolltypechanceresult"] = "{{chanceresult=[[{1d10cf<1}>10]]}}";
                    break
                }
                case "10": {
                    update["rolltype"] = `+${extraDice})d10!cs>10}>8]]}} {{chance=[[0]]}}`;
                    update["rolltypeattack"] = `+${extraDice})d10!cs>10}>8]]}} {{chance=[[0]]}}`;
                    update["rollsimple"] = `${update["rollsimple"]})d10!cs>10}>8]]}} {{chance=[[0]]}}`;
                    update["rolltypechanceresult"] = "{{chanceresult=[[{1d10cf<1}>10]]}}";
                    break
                }
                case "9": {
                    update["rolltype"] = `+${extraDice})d10!>9cs>9}>8]]}} {{9again=1}} {{chance=[[0]]}}`;
                    update["rolltypeattack"] = `+${extraDice})d10!>9cs>9}>8]]}} {{9again=1}} {{chance=[[0]]}}`;
                    update["rollsimple"] = `${update["rollsimple"]})d10!>9cs>9}>8]]}} {{9again=1}} {{chance=[[0]]}}`;
                    update["rolltypechanceresult"] = "{{chanceresult=[[{1d10cf<1}>10]]}}";
                    break
                }
                case "8": {
                    update["rolltype"] = `+${extraDice})d10!>8cs>8}>8]]}} {{8again=1}} {{chance=[[0]]}}`;
                    update["rolltypeattack"] = `+${extraDice})d10!>8cs>8}>8]]}} {{8again=1}} {{chance=[[0]]}}`;
                    update["rollsimple"] = `${update["rollsimple"]})d10!>8cs>8}>8]]}} {{8again=1}} {{chance=[[0]]}}`;
                    update["rolltypechanceresult"] = "{{chanceresult=[[{1d10cf<1}>10]]}}";
                    break
                }
                case "1": {
                    update["rolltype"] = `+${extraDice})d10ro<7}>8]]}} {{rote=1}} {{chance=[[0]]}}`;
                    update["rolltypeattack"] = `+${extraDice})d10ro<7}>8]]}} {{rote=1}} {{chance=[[0]]}}`;
                    update["rollsimple"] = `${update["rollsimple"]})d10ro<7}>8]]}} {{rote=1}} {{chance=[[0]]}}`;
                    update["rollchance"] = "&{template:wod-simple} {{name=@{character_name}}} {{option=1}} {{result=[[{1d10ro<7cf<1}>10]]}} {{chance=[[1]]}} {{rote=1}}";
                    update["rolltypechanceresult"] = "{{chanceresult=[[{1d10ro<7cf<1}>10]]}}";
                    break
                }
            }
            if (extraDice) {
                update["rolltype"] += " {{extramodline=@{extrarollmoddisplay}}}"
                update["rolltypeattack"] += " {{extramodline=@{extrarollmoddisplay}}}"
                update["extrarollmoddisplay"] = extraRollMods.join("<br>")
            } else {
                update["extrarollmoddisplay"] = ""
            }  
            
            
            // (PRD-1406) Verify attack roll construction:
            // for(var i = 0; i < 5; i++) {
            //     var attackRoll = v[`attack_type${i}`]
            //     if (!attackRoll.match(/{{2nd=1}} {{(?:str|dex)=1}} {{(?:bra|wea|fir|ath)=1}} {{skilldisplay=@{attackskilldisplay}}} {{result=\[\[{\(\(@{(?:strength|dexterity)}\+@{(?:brawl|weaponry|firearms|athletics)}\+@{rollmodifier}\+@{wound_penalty}\+@{weapon_penalty}\+@{armor_penalty}-@{target_defense}\)/g)) {
                    

            //     switch(v[`attack_type${i}`]) {
            //         // Brawl
            //         case "{{2nd=1}} {{str=1}} {{bra=1}} {{result=[[{((@{strength}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //             break
            //         // Melee
            //         case "{{2nd=1}} {{str=1}} {{wea=1}} {{result=[[{((@{strength}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //             break;
            //         // Gun
            //         case "{{2nd=1}} {{dex=1}} {{fir=1}} {{result=[[{((@{dexterity}+@{firearms}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //             break;
            //         // Thrown
            //         case "{{2nd=1}} {{dex=1}} {{ath=1}} {{result=[[{((@{dexterity}+@{athletics}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //             break;
            //         // Brawl (FF)
            //         case "{{2nd=1}} {{dex=1}} {{bra=1}} {{result=[[{((@{dexterity}+@{brawl}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //             break;
            //         // Melee (FF)
            //         case "{{2nd=1}} {{dex=1}} {{wea=1}} {{result=[[{((@{dexterity}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     }

            //     // if(isSecondEdition) {
            //     //     switch(v[`attack_type${i}`]) {
            //     //         // Melee
            //     //         case "{{1st=1}} {{str=1}} {{wea=1}} {{result=[[{((@{attack_damage${i}}+@{strength}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     //             update[`attack_type${i}`] = "{{2nd=1}} {{str=1}} {{wea=1}} {{result=[[{((@{strength}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})";
            //     //             break;
            //     //         // Gun
            //     //         case "{{1st=1}} {{dex=1}} {{fir=1}} {{result=[[{((@{attack_damage${i}}+@{dexterity}+@{firearms}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     //             update[`attack_type${i}`] = "{{2nd=1}} {{dex=1}} {{fir=1}} {{result=[[{((@{dexterity}+@{firearms}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})";
            //     //             break;
            //     //         // Thrown
            //     //         case "{{1st=1}} {{dex=1}} {{ath=1}} {{result=[[{((@{attack_damage1}+@{dexterity}+@{athletics}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     //             update[`attack_type${i}`] = "{{2nd=1}} {{dex=1}} {{ath=1}} {{result=[[{((@{dexterity}+@{athletics}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})";
            //     //             break;
            //     //         // Brawl (FF)
            //     //         case "{{1st=1}} {{dex=1}} {{bra=1}} {{result=[[{((@{attack_damage1}+@{dexterity}+@{brawl}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     //             update[`attack_type${i}`] = "{{2nd=1}} {{dex=1}} {{bra=1}} {{result=[[{((@{dexterity}+@{brawl}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})";
            //     //             break;
            //     //         // Melee (FF)
            //     //         case "{{1st=1}} {{dex=1}} {{wea=1}} {{result=[[{((@{attack_damage1}+@{dexterity}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     //             update[`attack_type${i}`] = "{{2nd=1}} {{dex=1}} {{wea=1}} {{result=[[{((@{dexterity}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})";
            //     //             break;
            //     //     }
            //     // } else {
            //     //     switch(v[`attack_type${i}`]) {
            //     //         // Melee
            //     //         case "{{2nd=1}} {{str=1}} {{wea=1}} {{result=[[{((@{strength}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     //             update[`attack_type${i}`] = "{{1st=1}} {{str=1}} {{wea=1}} {{result=[[{((@{attack_damage${i}}+@{strength}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})";
            //     //             break;
            //     //         // Gun
            //     //         case "{{2nd=1}} {{dex=1}} {{fir=1}} {{result=[[{((@{dexterity}+@{firearms}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     //             update[`attack_type${i}`] = "{{1st=1}} {{dex=1}} {{fir=1}} {{result=[[{((@{attack_damage${i}}+@{dexterity}+@{firearms}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})";
            //     //             break;
            //     //         // Thrown
            //     //         case "{{2nd=1}} {{dex=1}} {{ath=1}} {{result=[[{((@{dexterity}+@{athletics}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     //             update[`attack_type${i}`] = "{{1st=1}} {{dex=1}} {{ath=1}} {{result=[[{((@{attack_damage1}+@{dexterity}+@{athletics}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})";
            //     //             break;
            //     //         // Brawl (FF)
            //     //         case "{{2nd=1}} {{dex=1}} {{bra=1}} {{result=[[{((@{dexterity}+@{brawl}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     //             update[`attack_type${i}`] = "{{1st=1}} {{dex=1}} {{bra=1}} {{result=[[{((@{attack_damage1}+@{dexterity}+@{brawl}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})";
            //     //             break;
            //     //         // Melee (FF)
            //     //         case "{{2nd=1}} {{dex=1}} {{wea=1}} {{result=[[{((@{dexterity}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})":
            //     //             update[`attack_type${i}`] = "{{1st=1}} {{dex=1}} {{wea=1}} {{result=[[{((@{attack_damage1}+@{dexterity}+@{weaponry}+@{rollmodifier}+@{wound_penalty}+@{weapon_penalty}+@{armor_penalty}-@{target_defense})";
            //     //             break;
            //     //     }
            //     // }
            // }
            for (const [name, val] of Object.entries(update))
                consoleLines.push(`${name.toUpperCase()}: ${typeof val === "string" ? `"${val}"` : val}`)
            console.log(consoleLines.join("\n"))
            setAttrs(update, {silent: true});
        });
    }

    var updateHealth = function() {
        getAttrs(["stamina","base_size","giant","small_framed","sheettype","resilience","bonus_health"], function(v) {
            var health = parseInt(v.stamina, 10) + parseInt(v.base_size, 10) + parseInt(v.giant, 10) + parseInt(v.small_framed, 10) + parseInt(v.bonus_health, 10);
            if(v.sheettype.indexOf("vampire2")) {
                health = health + parseInt(v.resilience, 10);
            }
            setAttrs({
                health: health
            });
        });
    }

    var updateWillpower = function() {
        getAttrs(["resolve","composure","bonus_willpower"], function(v) {
            var willpower = parseInt(v.resolve, 10) + parseInt(v.composure, 10) + parseInt(v.bonus_willpower, 10);
            setAttrs({
                willpower: willpower
            });
        });
    };

    var updateMoralHealth = function() {
        getAttrs(["wits","composure","bonus_moralhealth","sheettype"], function(v) {
            if (v.sheettype == "changeling2"){
                var moralhealth = parseInt(v.wits, 10) + parseInt(v.composure, 10) + parseInt(v.bonus_moralhealth);
                setAttrs({
                    moralhealth: moralhealth
                });
            }
        });
    }

    var updateAttacks = function() {
        getAttrs(["strength","attack","iron_stamina","attack_initiative0","attack_initiative1","attack_initiative2","attack_initiative3","attack_initiative4","attack_strength0","attack_strength1","attack_strength2","attack_strength3","attack_strength4","armor_flag0","armor_flag1","armor_flag2","armor_strength0","armor_strength1","armor_strength2","health","healthbox_1","healthbox_2","healthbox_3","healthbox_4","healthbox_5","healthbox_6","healthbox_7","healthbox_8","healthbox_9","healthbox_10","healthbox_11","healthbox_12","healthbox_13","healthbox_14","healthbox_15","healthbox_16"], function(v) {
            var str = parseInt(v.strength, 10);
            var regex = /attack_type(.)/;
            var atknum = v.attack.match(regex)[1];
            var init = isNaN(v["attack_initiative" + atknum]) === false && v["attack_initiative" + atknum] != "" ? v["attack_initiative" + atknum] : 0;
            console.log(`******** INIT PENALTY: ${init} ***********`)
            var wpen = str < v["attack_strength" + atknum] ? str - v["attack_strength" + atknum] : 0;
            var apen = 0;
            if(v.armor_flag0 != 0 && str < parseInt(v.armor_strength0)) {apen = apen + (str - parseInt(v.armor_strength0));};
            if(v.armor_flag1 != 0 && str < parseInt(v.armor_strength1)) {apen = apen + (str - parseInt(v.armor_strength1));};
            if(v.armor_flag2 != 0 && str < parseInt(v.armor_strength2)) {apen = apen + (str - parseInt(v.armor_strength2));};
            var wound_penalty = 0;
            var ironStamina = parseInt(v.iron_stamina, 10);
            if(v["healthbox_" + v.health] != 0) {
                wound_penalty = -3 + Math.min(ironStamina, 3);
            }
            else if(v["healthbox_" + (v.health - 1)] != 0) {
                wound_penalty = -2 + Math.min(ironStamina, 2);
            }
            else if(v["healthbox_" + (v.health - 2)] != 0) {
                wound_penalty = -1 + Math.min(ironStamina, 1);
            }
            setAttrs({
                weapon_penalty: wpen,
                wpendisplay: Math.abs(parseInt(wpen)|0),
                armor_penalty: apen,
                apendisplay: Math.abs(parseInt(apen)|0),
                initiative_penalty: init,
                initiativepenaltydisplay: Math.abs(parseInt(init)|0),
                wound_penalty: wound_penalty,
                woundpenaltydisplay: Math.abs(parseInt(wound_penalty)|0)
            });
        });
    }

    var updateDefense = function(defense_type = "lowest") {
        getAttrs(["athletics","brawl","dexterity","weaponry","wits"], function(v) {
            var athletics = (parseInt(v.athletics, 10) || 0);
            var brawl = (parseInt(v.brawl, 10) || 10); // PRD-1407
            var dexterity = (parseInt(v.dexterity, 10) || 0);
            var weaponry = (parseInt(v.weaponry, 10) || 10); // PRD-1407
            var wits = (parseInt(v.wits, 10) || 10);
            var defense;
            switch (defense_type) {
                case "lowest":
                    defense = Math.min(dexterity, wits);
                    break;
                case "highest":
                    defense = Math.max(dexterity, wits);
                    break;
                case "wits":
                    defense = wits;
                    break;
                case "dexterity":
                    defense = dexterity;
                    break;
                case "lowest_plus_athletics":
                    defense = Math.min(dexterity, wits) + athletics;
                    break;
                case "lowest_plus_brawl":
                    defense = Math.min(dexterity, wits) + brawl;
                    break;
                case "lowest_plus_weaponry":
                    defense = Math.min(dexterity, wits) + weaponry;
                    break;
            }
            setAttrs({defense_base: defense});
        });
    }

    var updateDefaultDefense = function() {
        getAttrs(["sheettype"], function(v) {
            var defense;
            if (v.sheettype === "mortal2" ||
                v.sheettype === "vampire2" ||
                v.sheettype === "werewolf2" ||
                v.sheettype === "mage2" ||
                v.sheettype === "promethean2" ||
                v.sheettype === "changeling2" ||
                v.sheettype === "demon" ||
                v.sheettype === "beast" ||
                v.sheettype === "hunter2")  {
                defense = "lowest_plus_athletics";
            }
            else {
                defense = "lowest";
            }
            setAttrs({defense_select: defense});
        });
    }

    var updateWoundPenalties = function() {
        getAttrs(["iron_stamina"], function(v) {
            var ironStamina = parseInt(v.iron_stamina, 10);
            var woundpenalties = '-1-2-3';
            const setWound = {};
            if (ironStamina >= 3) {
                woundpenalties = '';
            }
            else if (ironStamina === 2) {
                woundpenalties = '-1';
            }
            else if (ironStamina === 1) {
                woundpenalties = '-1-2';
            }
            [...Array(16).keys()].forEach(num => {
              setWound[`woundpenalties_${num+1}`]= woundpenalties;
            });
            setAttrs(setWound);
        });
    }

    var updatePotencyName = function() {
        getAttrs(["sheettype"], function(v){
            setAttrs({
                potency_name: potencyNames[v.sheettype]
            });
        });
    }
