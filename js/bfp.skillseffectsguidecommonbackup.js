countVar=0;
collapseID=1;
rawParseObj=[];

/*Check filedate*/
function checkUpdate(fileURL,localDate) {
    $.ajax({
    	type: "Head",
        dataType: "json",
        contentType: "text/plain; charset=UTF-8",
        url: fileURL,
        success: function(data, textStatus, request) {
    		lastModified = request.getResponseHeader("Last-Modified");
    		if (Date.parse(lastModified) > Date.parse(localDate))
    			$("#alertmodal").modal("show")
 	}
    })
}

/*Reset Local Storage*/
function resetLocalData(serverStr, corrupted) {
	/*LocalStorage Delete and Refresh*/
	if (corrupted)
		alert("Corrupted data detected or Data structure has changed. Proceed to Fix.");
	localStorage.removeItem(serverStr);
	localStorage.removeItem(serverStr+"date");
	history.pushState(null, null, location.pathname);
	location.reload(true);
}

/*JQ Param handling*/
function urlParam(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return '';
    }
    else{
       return decodeURIComponent(results[1]) || '';
    }
}

/*Build DATABASE IN MEMORY*/
function buildDB(unit) {
countVar=0; /*reset count*/
    /*Process for Each Unit*/
    $.each( unit, function( unitKey, valObj ) {
        nameSTR='<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#accordion" href="#unit'+collapseID+'"><img src="https://googledrive.com/host/0B4hJr8BXxvFZZVVOZWswdnlnYTg/icon'+valObj.guide_id+'.png" width="40" height="40"/> <kbd>'+valObj.guide_id+'</kbd> '+valObj.name+' '+valObj.rarity+'<i class="fa fa-star"></i> ['+valObj["element"].toUpperCase()+' Ref ID: '+valObj.id+']</a></h4></div><div id="unit'+collapseID+'" class="panel-collapse collapse"><div class="panel-body"><div class="container-fluid">';
	/*Stats Bits*/
        if (valObj.stats) {
            statsSTR='<div class="row equal"><div class="col-xs-12 col-sm-12 bg-primary"><h5><i class="fa fa-level-up fa-rotate-90"></i> <b>RAW Stats / Types and Variation</b></h5></div></div>';
            $.each(valObj.stats, function(stKey,stVal) {
            	statsSTR+='<div class="row equal"><div class="col-xs-2 col-sm-2 bi"><b>'+stKey+'</b></div>';
            	statsSTR+='<div class="col-xs-10 col-sm-10 bi">';
            	$.each(valObj.stats[stKey], function(stKey2,stVal2) {
            		statsSTR+='<button type="button" class="btn btn-default btn-sm disabled"><b>'+stKey2+': </b>'+stVal2+'</button>&nbsp;';
            	})
            	statsSTR+='</div></div>';
            })
        } else statsSTR='';
        /*Normal DMG % Distribution*/
        if (valObj["hit dmg% distribution"]) {
            dmgSTR='<div class="row equal"><div class="col-xs-12 col-sm-12 bg-warning"><h5><i class="fa fa-level-up fa-rotate-90"></i> <b>Normal Hits</b></h5></div></div>';
            dmgSTR+='<div class="row equal"><div class="col-xs-12 col-sm-12 bi">'+valObj["hits"]+' hits distributed as '+valObj["hit dmg% distribution"].join('% ')+'%</div></div>';
            /*Max BC Generated*/
            if (valObj["max bc generated"]) {
                dmgSTR+='<div class="row equal"><div class="col-xs-12 col-sm-12 bi"><b>Max BC generated:</b>&nbsp;'+valObj["max bc generated"]+'&nbsp;|&nbsp;<b>Max BC / Normal hit:</b>&nbsp;'+(parseInt(valObj["max bc generated"])/parseInt(valObj.hits))+'</div></div>';
            }
            if (valObj["lord damage range"]) {
                dmgSTR+='<div class="row equal"><div class="col-xs-12 col-sm-12 bi"><b>Lord Damage Range:</b>&nbsp;'+valObj["lord damage range"]+'</div></div>';
            }
        }
        /*Checks LS*/
        if (valObj["leader skill"]) {
            lsSTR='<div class="row equal"><div class="col-xs-12 col-md-12 bg-info"><h5><i class="fa fa-level-up fa-rotate-90"></i> <b>Leader Skill:</b> ['+valObj["leader skill"].name+'] '+valObj["leader skill"].desc+'</h5></div></div>';
            /*ls Heading*/
            lsSTR+='<div class="row equal"><div class="col-xs-5 col-md-5 bd">Tech Bits</div><div class="col-xs-7 col-md-7 bd">Value</div></div>';
            $.each(valObj["leader skill"], function(lsKey,lsVal) {
            	if ((lsKey!="effects") && (lsKey!="name") && (lsKey!="desc")) {
                	lsSTR+='<div class="row equal"><div class="col-xs-5 col-md-5 bi"><span class="ls">'+lsKey+"</span></div>";
                	lsSTR+='<div class="col-xs-7 col-md-7 bi">'+valObj["leader skill"][lsKey]+'</div></div>';
            	} else if (lsKey=="effects") {
            		for (j in valObj["leader skill"].effects) {
            			$.each(valObj["leader skill"].effects[j], function(lsKey2,lsVal2) {
            			lsSTR+='<div class="row equal"><div class="col-xs-5 col-md-5 bi"><span class="ls">'+lsKey2+"</span></div>";
                		lsSTR+='<div class="col-xs-7 col-md-7 bi">'+lsVal2+'</div></div>';
            			})
            		}
            	}
            })
        } else lsSTR="";

        /*Checks BB*/
        if (valObj["bb"]) {
            bbSTR='<div class="row equal"><div class="col-xs-12 col-md-12 bg-success"><h5><i class="fa fa-level-up fa-rotate-90"></i> <b>BB Skill: </b>['+valObj["bb"]["name"]+'] '+valObj["bb"]["desc"]+'</h5></div></div>';
            if (valObj["bb"]["hit dmg% distribution"]) {
                bbSTR+='<div class="row equal"><div class="col-xs-12 col-sm-12 bi">'+valObj['bb']["hits"]+' hits distributed as '+valObj['bb']["hit dmg% distribution"].join('% ')+'%</div></div>';
            }
            if (valObj["bb"]["max bc generated"]) {
                bbSTR+='<div class="row equal"><div class="col-xs-12 col-sm-12 bi"><b>Max BC generated:</b>&nbsp;'+valObj["bb"]["max bc generated"]+'&nbsp;|&nbsp;<b>Max BC / BB hit:</b>&nbsp;'+(parseInt(valObj["bb"]["max bc generated"])/parseInt(valObj.bb.hits))+'</div></div>';
            }
            /*BB Heading*/
            bbSTR+='<div class="row equal"><div class="col-xs-2 col-md-2 bd">Tech Bits</div>';
            for (i=0;i<10;i++) {
                    bbSTR+='<div class="col-xs-1 col-md-1 bd">Lv '+(i+1)+'</div>';
                }
            bbSTR+="</div>";
            $.each(valObj.bb.levels[0], function(bbKey,bbVal) {
                if (bbKey!="effects") {
                    bbSTR+='<div class="row equal"><div class="col-xs-2 col-md-2 bi"><span class="bb">'+bbKey+'</span></div>';
                    if (valObj.bb.levels[0][bbKey]==valObj.bb.levels[9][bbKey])
                    	bbSTR+='<div class="col-xs-10 col-md-10 bi" style="justify-content:center;">'+valObj.bb.levels[9][bbKey]+'</div>';
                    else
	                    for (i=0;i<10;i++) {
	                        bbSTR+='<div class="col-xs-1 col-md-1 bi">'+valObj.bb.levels[i][bbKey]+'</div>'
	                    }
                    bbSTR+="</div>";
                } else if (bbKey=="effects") {
                	for (j in valObj.bb.levels[0].effects) {
                		bbSTR+='<div class="row equal"><div class="col-xs-12 col-md-12 bd"></div></div>';
                		$.each(valObj.bb.levels[0].effects[j], function(bbKey2,bbVal2) {
                			if (bbVal2) {
	                			if (bbVal2.constructor === Object) {
	                				$.each(valObj.bb.levels[0].effects[j][bbKey2], function(bbKey3,bbVal3) {
		                				bbSTR+='<div class="row equal"><div class="col-xs-2 col-md-2 bi"><span class="bb">'+bbKey2+' ('+bbKey3+')</span></div>';
		                				if (valObj.bb.levels[0].effects[j][bbKey2][bbKey3]==valObj.bb.levels[9].effects[j][bbKey2][bbKey3])
		                					bbSTR+='<div class="col-xs-10 col-md-10 bi" style="justify-content:center;">'+valObj.bb.levels[9].effects[j][bbKey2][bbKey3]+'</div>';
		                				else
									for (k=0;k<10;k++) {
						                        	bbSTR+='<div class="col-xs-1 col-md-1 bi">'+valObj.bb.levels[k].effects[j][bbKey2][bbKey3]+'</div>'
									}
								bbSTR+="</div>";
	                				})
	                			}
	                			else {
							bbSTR+='<div class="row equal"><div class="col-xs-2 col-md-2 bi"><span class="bb">'+bbKey2+'</span></div>';
							if (valObj.bb.levels[0].effects[j][bbKey2]==valObj.bb.levels[9].effects[j][bbKey2])
								bbSTR+='<div class="col-xs-10 col-md-10 bi" style="justify-content:center;">'+valObj.bb.levels[9].effects[j][bbKey2]+'</div>';
							else
					                    for (k=0;k<10;k++) {
					                        bbSTR+='<div class="col-xs-1 col-md-1 bi">'+valObj.bb.levels[k].effects[j][bbKey2]+'</div>'
					                    }
		                    			bbSTR+="</div>";
	                			}
                			}
                		})
                		
                		
                	}
                }
            })
        } else bbSTR="";
        /*Checks SBB*/
        if (valObj["sbb"]) {
            sbbSTR='<div class="row equal"><div class="col-xs-12 col-md-12 bg-danger"><h5><i class="fa fa-level-up fa-rotate-90"></i> <b>SBB Skill: </b>['+valObj["sbb"]["name"]+'] '+valObj["sbb"]["desc"]+'</h5></div></div>';
            if (valObj["sbb"]["hit dmg% distribution"]) {
                sbbSTR+='<div class="row equal"><div class="col-xs-12 col-sm-12 bi">'+valObj["sbb"]["hits"]+' hits distributed as '+valObj["sbb"]["hit dmg% distribution"].join('% ')+'%</div></div>';
            }
            if (valObj["sbb"]["max bc generated"]) {
                sbbSTR+='<div class="row equal"><div class="col-xs-12 col-sm-12 bi"><b>Max BC generated:</b>&nbsp;'+valObj["sbb"]["max bc generated"]+'&nbsp;|&nbsp;<b>Max BC / SBB hit:</b>&nbsp;'+(parseInt(valObj["sbb"]["max bc generated"])/parseInt(valObj.sbb.hits))+'</div></div>';
            }
            /*SBB Heading*/
            sbbSTR+='<div class="row equal"><div class="bd col-xs-2 col-md-2">Tech Bits</div>';
            for (i=0;i<10;i++) {
                    sbbSTR+='<div class="bd col-xs-1 col-md-1">Lv '+(i+1)+'</div>';
                }
            sbbSTR+="</div>";
            $.each(valObj.sbb.levels[0], function(sbbKey,sbbVal) {
                if (sbbKey!="effects") {
                    sbbSTR+='<div class="row equal"><div class="col-xs-2 col-md-2 bi"><span class="sbb">'+sbbKey+'</span></div>';
                    if (valObj.sbb.levels[0][sbbKey]==valObj.sbb.levels[9][sbbKey])
                    	sbbSTR+='<div class="col-xs-10 col-md-10 bi" style="justify-content:center;">'+valObj.sbb.levels[9][sbbKey]+'</div>';
                    else
	                    for (i=0;i<10;i++) {
				sbbSTR+='<div class="col-xs-1 col-md-1 bi">'+valObj.sbb.levels[i][sbbKey]+'</div>'
	                    }
                    sbbSTR+="</div>";
                } else if (sbbKey=="effects") {
                	for (j in valObj.sbb.levels[0].effects) {
                		sbbSTR+='<div class="row equal"><div class="col-xs-12 col-md-12 bd"></div></div>';
                		$.each(valObj.sbb.levels[0].effects[j], function(sbbKey2,sbbVal2) {
                			if (sbbVal2) {
	                			if (sbbVal2.constructor === Object) {
	                				$.each(valObj.sbb.levels[0].effects[j][sbbKey2], function(sbbKey3,sbbVal3) {
		                				sbbSTR+='<div class="row equal"><div class="col-xs-2 col-md-2 bi"><span class="sbb">'+sbbKey2+' ('+sbbKey3+')</span></div>';
		                				if (valObj.sbb.levels[0].effects[j][sbbKey2][sbbKey3]==valObj.sbb.levels[9].effects[j][sbbKey2][sbbKey3])
		                					sbbSTR+='<div class="col-xs-10 col-md-10 bi" style="justify-content:center;">'+valObj.sbb.levels[9].effects[j][sbbKey2][sbbKey3]+'</div>';
		                				else
									for (k=0;k<10;k++) {
						                        	sbbSTR+='<div class="col-xs-1 col-md-1 bi">'+valObj.sbb.levels[k].effects[j][sbbKey2][sbbKey3]+'</div>'
									}
								sbbSTR+="</div>";
	                				})
	                			}
	                			else {
	                				sbbSTR+='<div class="row equal"><div class="col-xs-2 col-md-2 bi"><span class="sbb">'+sbbKey2+'</span></div>';
	                				if (valObj.sbb.levels[0].effects[j][sbbKey2]==valObj.sbb.levels[9].effects[j][sbbKey2])
	                					sbbSTR+='<div class="col-xs-10 col-md-10 bi" style="justify-content:center;">'+valObj.sbb.levels[9].effects[j][sbbKey2]+'</div>';
	                				else
								for (k=0;k<10;k++) {
					                        	sbbSTR+='<div class="col-xs-1 col-md-1 bi">'+valObj.sbb.levels[k].effects[j][sbbKey2]+'</div>'
								}
	                    				sbbSTR+="</div>";
	                			}
                			}
                		})
                	}
                }
            })
        } else sbbSTR="";
	/*Checks UBB*/
        if (valObj["ubb"]) {
            ubbSTR='<div class="row equal"><div class="col-xs-12 col-md-12 bg-danger text-danger"><h5><i class="fa fa-level-up fa-rotate-90"></i> <b>UBB Skill: </b>['+valObj["ubb"]["name"]+'] '+valObj["ubb"]["desc"]+'</h5></div></div>';
            if (valObj["ubb"]["hit dmg% distribution"]) {
                ubbSTR+='<div class="row equal"><div class="col-xs-12 col-sm-12 bi">'+valObj["ubb"]["hits"]+' hits distributed as '+valObj["ubb"]["hit dmg% distribution"].join('% ')+'%</div></div>';
            }
            if (valObj["ubb"]["max bc generated"]) {
                ubbSTR+='<div class="row equal"><div class="col-xs-12 col-sm-12 bi"><b>Max BC generated:</b>&nbsp;'+valObj["ubb"]["max bc generated"]+'&nbsp;|&nbsp;<b>Max BC / UBB hit:</b>&nbsp;'+(parseInt(valObj["ubb"]["max bc generated"])/parseInt(valObj.ubb.hits))+'</div></div>';
            }
            /*UBB Heading*/
            ubbSTR+='<div class="row equal"><div class="bd col-xs-2 col-md-2">Tech Bits</div>';
            for (i=0;i<10;i++) {
                    ubbSTR+='<div class="bd col-xs-1 col-md-1">Lv '+(i+1)+'</div>';
                }
            ubbSTR+="</div>";
            $.each(valObj.ubb.levels[0], function(ubbKey,ubbVal) {
                if (ubbKey!="effects") {
                    ubbSTR+='<div class="row equal"><div class="col-xs-2 col-md-2 bi"><span class="ubb">'+ubbKey+'</span></div>';
                    if (valObj.ubb.levels[0][ubbKey]==valObj.ubb.levels[9][ubbKey])
                    	ubbSTR+='<div class="col-xs-10 col-md-10 bi" style="justify-content:center;">'+valObj.ubb.levels[9][ubbKey]+'</div>';
                    else
	                    for (i=0;i<10;i++) {
				ubbSTR+='<div class="col-xs-1 col-md-1 bi">'+valObj.ubb.levels[i][ubbKey]+'</div>'
	                    }
                    ubbSTR+="</div>";
                } else if (ubbKey=="effects") {
                	for (j in valObj.ubb.levels[0].effects) {
                		ubbSTR+='<div class="row equal"><div class="col-xs-12 col-md-12 bd"></div></div>';
                		$.each(valObj.ubb.levels[0].effects[j], function(ubbKey2,ubbVal2) {
                			if (ubbVal2) {
	                			if (ubbVal2.constructor === Object) {
	                				$.each(valObj.ubb.levels[0].effects[j][ubbKey2], function(ubbKey3,ubbVal3) {
		                				ubbSTR+='<div class="row equal"><div class="col-xs-2 col-md-2 bi"><span class="ubb">'+ubbKey2+' ('+ubbKey3+')</span></div>';
		                				if (valObj.ubb.levels[0].effects[j][ubbKey2][ubbKey3]==valObj.ubb.levels[9].effects[j][ubbKey2][ubbKey3])
		                					ubbSTR+='<div class="col-xs-10 col-md-10 bi" style="justify-content:center;">'+valObj.ubb.levels[9].effects[j][ubbKey2][ubbKey3]+'</div>';
		                				else
									for (k=0;k<10;k++) {
						                        	ubbSTR+='<div class="col-xs-1 col-md-1 bi">'+valObj.ubb.levels[k].effects[j][ubbKey2][ubbKey3]+'</div>'
									}
								ubbSTR+="</div>";
	                				})
	                			}
	                			else {
	                				ubbSTR+='<div class="row equal"><div class="col-xs-2 col-md-2 bi"><span class="ubb">'+ubbKey2+'</span></div>';
	                				if (valObj.ubb.levels[0].effects[j][ubbKey2]==valObj.ubb.levels[9].effects[j][ubbKey2])
	                					ubbSTR+='<div class="col-xs-10 col-md-10 bi" style="justify-content:center;">'+valObj.ubb.levels[9].effects[j][ubbKey2]+'</div>'
	                				else
								for (k=0;k<10;k++) {
					                        	ubbSTR+='<div class="col-xs-1 col-md-1 bi">'+valObj.ubb.levels[k].effects[j][ubbKey2]+'</div>'
								}
	                    				ubbSTR+="</div>";
	                			}
                			}
                		})
                	}
                }
            })
        } else ubbSTR="";
        if (valObj.ai) {
		/*AI Heading*/
		var aiCol=valObj['ai'].length;
		aiSTR='<div class="row equal"><div class="col-xs-12 col-md-12 bg-primary"><h5><i class="fa fa-level-up fa-rotate-90"></i> <b>ARENA AI</b> [Action Probability & Triggers]</h5></div></div>';
            	aiSTR+='<div class="row equal"><div class="bd col-xs-2 col-md-2">Tech Bits</div>';
		for (i=0;i<aiCol;i++) {
			aiSTR+='<div class="bd col-xs-2 col-md-2">Action '+(i+1)+'</div>';
		}
		for (i=1;i<=5-aiCol;i++) {
			aiSTR+='<div class="bd col-xs-2 col-md-2"></div>';
		}
            	aiSTR+="</div>";
        	/*AI*/
        	$.each(valObj.ai[0], function(aiKey,aiVal) {
        		aiSTR+='<div class="row equal"><div class="bd col-xs-2 col-md-2">'+aiKey+'</div>';
	        	for (i=0;i<valObj.ai.length;i++) {
	        		aiSTR+='<div class="bi col-xs-2 col-md-2">'+valObj.ai[i][aiKey]+'</div>';
	        	}
			for (i=1;i<=5-aiCol;i++) {
				aiSTR+='<div class="bd col-xs-2 col-md-2"></div>';
			}
			aiSTR+="</div>";
        	})
        } else aiSTR="";
        /*Append each HTML*/
        var splitSTR='<div class="row">&nbsp;</div>';
        var appendSTR=nameSTR+statsSTR+splitSTR+aiSTR+splitSTR+dmgSTR+splitSTR+lsSTR+splitSTR+bbSTR+splitSTR+sbbSTR+splitSTR+ubbSTR+'</div></div></div></div>';
        /*Parse into MEMORY DB*/
        rawParseObj.push({"name":valObj.name, "collapseCode":appendSTR,"id":valObj.guide_id,"rarity":valObj.rarity});
        countVar+=1;
        collapseID+=1;
    }); /*Each record*/
    
	var aheadNameRead = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		local: $.map(rawParseObj, function(uName) { return { value: uName.name }; })
	});
	aheadNameRead.initialize();
	$('#searchNameBox').typeahead({
		hint: true,
		highlight: true,
		minLength: 1
	},
	{
		displayKey: 'value',
		source: aheadNameRead.ttAdapter()
	});
    
    $("#unitCount").html(countVar);
    setTimeout($('#progressModal').modal('hide'),4000);
    
    /*check for card param*/
    var searchParam=urlParam('unitid');
    if (searchParam != "") {
        /*sets searchbox value then execute*/
        $('#searchIdBox').val(searchParam);
        searchIdRun();
    }
    /*check for card param*/
    var searchParam=urlParam('query');
    if (searchParam != "") {
        /*sets searchbox value then execute*/
        $('#searchNameBox').val(searchParam);
        searchNameRun();
    }
}

/*check valid json*/
function isValidJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/*Update URL based on bb filters*/
$(document).on("click", '.skillEffect', function(e){
    e.preventDefault();
	skillRun($(this).text());
})

/*Update URL based on sbb filters*/
$(document).on("click", '.skillEffect2', function(e){
    e.preventDefault();
	skillRun2($(this).text());
})

/*Update URL based on rarity filters*/
$(document).on("click", '.raritySelect', function(e){
    e.preventDefault();
	rarityRun($(this).text().charAt(0));
})

/*Update URL based on ls filters*/
$(document).on("click", '.lsEffect', function(e){
    e.preventDefault();
	lsRun($(this).text());
})

/*Update URL based on search filters*/
$(document).on("click", '#searchIdBtn', function(e){
    e.preventDefault();
	searchIdRun()
})

/*Update URL based on search filters*/
$(document).on("click", '#searchNameBtn', function(e){
    e.preventDefault();
	searchNameRun()
})

/*Binds Enter KEY to BOX*/
$( "#searchIdBox" ).keypress( function( event ) {
  if ( event.which == 13 ) {
     searchIdRun()
  }
})

/*Binds Enter KEY to BOX*/
$( "#searchNameBox" ).keypress( function( event ) {
  if ( event.which == 13 ) {
     searchNameRun()
  }
})

/*POP state*/
$(window).on('popstate', function(ev) {
	var state = ev.originalEvent.state;
	/*Search query state*/
	if (state.stateIdFilter) {
	        $('#searchIdBox').val(state.stateIdFilter);
	        searchIdRun();
	}
	/*Search query state*/
	if (state.stateNameFilter) {
	        $('#searchNameBox').val(state.stateNameFilter);
	        searchNameRun();
	}
})
