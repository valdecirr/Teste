var SiteUrl = null;
var SiteUser = null;

function GetList(guid) {
	var url = SiteUrl + "_api/web/lists(guid'" + guid + "')";
	return CallJson('g', guid, url, "GET", false, null);
}

function GetListItemById(guid, id) {
	var url = SiteUrl + "_api/web/lists(guid'" + guid + "')/items('" + id + "')";
	var result = CallJson('g', guid, url, "GET", false, null);
	if (result != null && result.results != null && !result.IsJsonError) {
		if (result.results.length == 0) {
			result = null;
		} else {
			result = result.results[0];
		}
	}
	return result;
}

function GetListItemByCaml(guid, caml) {
	var url = SiteUrl + "_api/web/lists(guid'" + guid + "')/items" + caml;
	var result = CallJson('g', guid, url, "GET", false, null);
	if (result != null && result.results != null && !result.IsJsonError) {
		if (result.results.length == 0) {
			result = null;
		} else {
			result = result.results[0];
		}
	}
	return result;
}

function GetListItems(guid, caml) {
	var url = SiteUrl + "_api/web/lists(guid'" + guid + "')/items" + caml;
	var result = CallJson('g', guid, url, "GET", false, null);
	if (result != null && result.results != null && !result.IsJsonError) {
		result = result.results;
	}
	if (result != null && result.length == 0 && !result.IsJsonError) {
		result = null;
	}
	if (result == null) {
		result = [];
	}
	return result;
}

function DeleteListItems(guid, id) {
	var url = SiteUrl + "_api/web/lists(guid'" + guid + "')/items('" + id + "')";
	return CallJson('d', guid, url, "POST", false, null);
}

function UpdateListItems(guid, id, data) {
	var url = SiteUrl + "_api/web/lists(guid'" + guid + "')/items";

	if (id == null || id == 0) {
		return CallJson('i', guid, url, "POST", false, data);
	} else {
		url += "(" + id + ")";
		return CallJson('e', guid, url, "POST", false, data);
	}

}

function AddListItemAttachment(guid, id, file, onpostend) {

	var reader = new FileReader();
	reader.onloadend = function (e) {
		var data = e.target.result;
		if (data.byteLength == null || data.byteLength <= 0) {
			alert('Failed to upload content of file ' + file.name);
		}
		var url = SiteUrl + "_api/web/lists(guid'" + guid + "')/items('" + id + "')/AttachmentFiles/add(FileName='" + file.name + "')";
		var result = CallJson('a', guid, url, "POST", false, data);
		onpostend(result);
	};
	reader.readAsArrayBuffer(file);
}

function GetListItemAttachments(guid, id) {
	var url = SiteUrl + "_api/web/lists(guid'" + guid + "')/items('" + id + "')/AttachmentFiles";
	var result = CallJson('g', guid, url, "GET", false, null);
	if (result != null && result.results != null && !result.IsJsonError) {
		result = result.results;
	}
	if (result != null && result.length == 0 && !result.IsJsonError) {
		result = null;
	}
	if (result == null) {
		result = [];
	}
	return result;
}

function DeleteListItemAttachment(guid, id, fileName) {
	var url = SiteUrl + "_api/web/lists(guid'" + guid + "')/items('" + id + "')/AttachmentFiles/getByFileName('" + fileName + "')";
	return CallJson('d', guid, url, "POST", false, null);
}

function CallJson(mode, guid, url, method, async, data) {

	var headers;
	var result = null;
	var dataStr = null;
	var processData = true;

	switch(mode) {

	    case 'e':
			headers = { "X-HTTP-Method":"MERGE",
			            "ACCEPT": "application/json;odata=verbose",
			            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
			            "IF-MATCH": "*" };
	        break;

		case 'd':
			headers = { "X-HTTP-Method":"DELETE",
			            "ACCEPT": "application/json;odata=verbose",
			            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
			            "IF-MATCH": "*" };
			break;

		case 'a':
			headers = { "ACCEPT": "application/json;odata=verbose",
			            "X-RequestDigest": $("#__REQUESTDIGEST").val() };
			processData = false;
	        break;

	    default:
	   		headers = { "ACCEPT": "application/json;odata=verbose",
			            "X-RequestDigest": $("#__REQUESTDIGEST").val() };

	}

	if (mode != 'g' && mode != 'a' && data != null && data.__metadata == null) {
		AddListMetadata(guid, data);
	}

	if (mode != 'a') {
		dataStr = JSON.stringify(data);
	} else {
		dataStr = data;
	}

	$.ajax({
        url: url,
        method: method,
        async: async,
        contentType: "application/json;odata=verbose",
        data: dataStr,
		headers: headers,
		processData: processData,
        success:  function (d) {
			if (d != null && d.d != null) {
				result = d.d;
			}
			if (result == null) {
				result = {IsJsonError: false};
			}
        },
        error: function(error) {
        	console.log("AJAX error in request: " + JSON.stringify(error, null, 2));
        	result = error;
        	result.IsJsonError = true;
        }
    });

	return result;

}

function AddListMetadata(guid, data) {
	var list = GetList(guid);
	if (list != null && !list.IsJsonError) {
		data.__metadata = {'type': 'SP.Data.' + list.EntityTypeName + 'Item'};
	}
}

function CheckAndDisplayJsonError(result) {
	if (result != null && result.IsJsonError) {
		alert('An internal error occurred, please contact with system administrator\n\n' + JSON.stringify(result, null, 2))
		return true;
	} else {
		return false;
	}
}

function LoadCurrentUser() {
	var url = SiteUrl + "_api/web/currentuser?$expand=groups";
	var user = CallJson('b', null, url, 'GET', false, null);
	if (user != null && !user.IsJsonError) {
		SiteUser = { Id: user.Id,
		             Name: user.Title,
		             Login: user.LoginName,
		             Email: user.Email,
		             Groups: $.map(user.Groups.results,
		             			function (item) {
		             				return { Id: item.Id,
		             				         Name: item.Title.toUpperCase() }
		             			})
					};

	} else {
		SiteUser = null;
	}

}

function GetSiteUserId(name) {
	var id = null;
	var user = null;

	if (name != null) {
		user = CallJson('g', null, SiteUrl + "_api/web/siteusers(@v)?@v='" + encodeURIComponent(name) + "'", "GET", false, null);
		if (user != null && !user.IsJsonError) {
			id = user.Id;
		}
	}

	return id;
}

function GetSiteUserIdByName(name) {
	var data = null;
	var user = null;

	if (name != null) {
		user = CallJson('g', null, SiteUrl + "_api/web/siteusers?$filter=Title%20eq%20'" + name +"'", "GET", false, null);
		if (user != null && !user.IsJsonError) {
			data = user;
		}
	}

	return data;
}

function GetSiteGroup(name) {
	var group = null;

	if (name != null) {
		group = CallJson('g', null, SiteUrl + "/_api/web/sitegroups/getbyname('" + name + "')", "GET", false, null);
		if (group != null && group.IsJsonError) {
			group = null;
		}
	}

	return group;
}

function GetURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0].toLowerCase() == sParam.toLowerCase()) {
            return sParameterName[1];
        }
    }
}

function AddDropDownItem(id, cd, vl) {

	var sel = document.getElementById(id);
    var i;
    var exists = false;

	if (sel != null) {

		if (sel.options != null) {
		    for(i = 0; i < sel.options.length; i++) {
		        if (sel.options[i] != null && sel.options[i].value == cd) {
		        	exists = true;
		        }
		    }
	    }

	    if (!exists) {

			var opt = document.createElement('option');
		    opt.value = cd;
		    opt.innerHTML = vl;
		    sel.appendChild(opt);

	    }

	}
}

function MoveDropDownSelectedItems(from, to) {

	to.find('option:selected').each(function() {
		this.selected = false;
	});

	from.find('option:selected').each(function() {
		to.append(new Option(this.text, this.value, true));
		this.selected = false;
		this.remove();
	});

	to.append(to.find('option').remove().sort(function(a, b) {
		var at = a.text, bt = b.text;
		return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
	}));

}

function FieldIsEditable(id) {

	var fld = $('#' + id);

	return fld != null &&
	       fld.is(':visible') &&
	       !fld.is(':disabled') &&
	       !fld.is('[readonly]');

}

function FieldValueIsValid(id, tp) {

	var fld = $('#' + id);
	var val = null;
	var valid = false;

	if (fld == null) {
		return false;
	}

	if(!FieldIsEditable(id)) {
		return true;
	}

	val = $(fld).val()
	valid = ValueIsValid(val, tp);

	SetGroupErrorClass(id, !valid);

	return valid;

}

function ValueIsValid(val, tp) {

	var valid = false;

	try {

		switch(tp) {

		    case 's':
		        valid = val != null && val != '' && val.length > 0;
		        break;

		    case 'd':
		        valid = val != null && val != '' && TextToDate(val) != null;
		        break;

		    case 'n':
		        valid = val != null && val > 0;
		        break;

		    default:
		        valid = false;

		}

	} catch(e) {
		valid = false;
	}

	return valid;

}

function DateRangeIsValid(id1, id2, req) {

	var fld1 = $('#' + id1);
	var fld2 = null;

	var dt1 = null;
	var dt2 = null;
	var valid = false;

	if(!FieldIsEditable(id1)) {
		return true;
	}

	if (id2 != null) {
		fld2 = $('#' + id2);
	}

	if (fld1 == null || (id2 != null && fld2 == null)) {
		return false;
	}

	try {

		dt1 = $(fld1).val();

		if (fld2 != null) {
			dt2 = $(fld2).val();
		} else {
			dt2 = dt1;
			dt1 = DateToString(new Date());
		}

		if (dt1 == null || dt2 == null || dt1.length == 0 || dt2.length == 0) {

			valid = !req;

		} else {

			dt1 = TextToDate(dt1);
			dt2 = TextToDate(dt2);

			valid = dt2 >= dt1;

		}

	} catch(e) {
		valid = false;
	}

	SetGroupErrorClass(id1, !valid);
	SetGroupErrorClass(id2, !valid);

	return valid;

}


function SetGroupErrorClass(id, add) {

	if (id == null) {
		return;
	}

	var fld = $('#' + id);
	var grp = null;

	if (fld == null) {
		return;
	}

	grp = fld;
	while (grp != null && !$(grp).hasClass("input-group")) {
		grp = $(grp).parent();
	}

	if (grp != null) {
		if (add) {
			$(grp).addClass("has-error");
		} else {
			$(grp).removeClass("has-error");
		}
	}

}

function TextToDate(txt) {

	var year = 0;
	var month = 0;
	var day = 0;
	var hours = 0;
	var minutes = 0;
	var seconds = 0;

	if (txt == null || txt.length < 10) {
		return null;
	}

	var parts1 = txt.split(' ');
	if (parts1.length == 0) {
		return null;
	}

	var parts2 = parts1[0].split('/');
	if (parts2.length != 3) {
		return null;
	} else {
		day   = parts2[0];
		month = parts2[1] - 1;
		year  = parts2[2];
	}

	if (parts1.length > 1) {

		parts2 = parts1[1].split(':');
		if (parts2.length < 2) {
			return null;
		} else {
			hours   = parts2[0];
			minutes = parts2[1];
			if (parts2.length > 2) {
				seconds = parts2[1];
			}
		}
	}

	return new Date(year, month, day, hours, minutes, seconds);

}

function DateToJSON(d) {
	var dt;

	if (d == null) {
		dt = null
	} else {
		dt = lpad(d.getUTCFullYear(), "0", 4)  + '-' +
		     lpad(d.getUTCMonth() + 1, "0", 2) + '-' +
		     lpad(d.getUTCDate(), "0", 2)      + 'T' +
		     lpad(d.getUTCHours(), "0", 2)     + ':' +
		     lpad(d.getUTCMinutes(), "0", 2)   + ':' +
		     lpad(d.getUTCSeconds(), "0", 2)   + 'Z';
	};

	return dt;

}

function JsonToDate(txt) {
	var dt = null;
	if (txt == null || txt.length < 10) {
		return null;
	}
	return new Date(txt);
}

function DateToString(date) {
	if (date == null || "" + date.length < 10) {
		return null;
	}

	var year = date.getFullYear();
	var month = (1 + date.getMonth()).toString();
	var day = date.getDate().toString();

	month = month.length > 1 ? month : '0' + month;
	day = day.length > 1 ? day : '0' + day;

	return day + '/' + month + '/' + year;
}

function lpad(txt, padString, length) {
    var str = "" + txt;
    while (str.length < length)
        str = "" + padString + str;
    return str;
}

function AutocompleteSiteUserSource(id, request, response, groupId) {
	$('#' + id + '_id').val('');
	$('#' + id + '_login').val('');

	if (request.term == null || ('' + request.term).length < 3)
		return;

	var users = AutocompleteSiteUserSearch(request.term, groupId);

	if (users != null && !users.IsJsonError && users.ClientPeoplePickerSearchUser != null) {
	    var results = JSON.parse(users.ClientPeoplePickerSearchUser);
		if (results.length > 0) {
			response($.map(results, function (item) {
				return {
					label: item.DisplayText,
					value: item.DisplayText,
					login: item.Key}
			}));
		}
	}
}

function AutocompleteSiteUserSelect(event, ui) {
	$('#' + this.id + '_id').val(GetSiteUserId(ui.item.login));
	$('#' + this.id + '_login').val(ui.item.login);
}

function AutocompleteSiteUserSearch(query, groupId) {
	var data = {
	    queryParams: {
	        __metadata: {
	            type: 'SP.UI.ApplicationPages.ClientPeoplePickerQueryParameters'
	        },
	        AllowEmailAddresses: true,
	        AllowMultipleEntities: false,
	        AllUrlZones: false,
	        MaximumEntitySuggestions: 50,
	        PrincipalSource: 15,
	        PrincipalType: 15,
	        QueryString: query,
	        SharePointGroupID: groupId,
	        Required: false
	    }
	};

	var url = SiteUrl + "_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.clientPeoplePickerSearchUser";
	var result = CallJson('g', null, url, "POST", false, data);

	return result;
}

function AutocompleteCountrySource(request, response) {

	var countries = [{Id: 'AF', Name: 'Afghanistan'}, {Id: 'AX', Name: 'Aland Islands'}, {Id: 'AL', Name: 'Albania'}, {Id: 'DZ', Name: 'Algeria'}, {Id: 'AS', Name: 'American Samoa'}, {Id: 'AD', Name: 'Andorra'}, {Id: 'AO', Name: 'Angola'}, {Id: 'AI', Name: 'Anguilla'}, {Id: 'AG', Name: 'Antigua and Barbuda'}, {Id: 'AR', Name: 'Argentina'}, {Id: 'AM', Name: 'Armenia'}, {Id: 'AU', Name: 'Australia'}, {Id: 'AT', Name: 'Austria'}, {Id: 'AZ', Name: 'Azerbaijan'}, {Id: 'BS', Name: 'Bahamas'}, {Id: 'BH', Name: 'Bahrain'}, {Id: 'BD', Name: 'Bangladesh'}, {Id: 'BB', Name: 'Barbados'}, {Id: 'BY', Name: 'Belarus'}, {Id: 'BE', Name: 'Belgium'}, {Id: 'BZ', Name: 'Belize'}, {Id: 'BJ', Name: 'Benin'}, {Id: 'BM', Name: 'Bermuda'}, {Id: 'BT', Name: 'Bhutan'}, {Id: 'BO', Name: 'Bolivia'}, {Id: 'BQ', Name: 'Bonaire, Saint Eustatius and Saba '}, {Id: 'BA', Name: 'Bosnia and Herzegovina'}, {Id: 'BW', Name: 'Botswana'}, {Id: 'BR', Name: 'Brazil'}, {Id: 'BN', Name: 'Brunei'}, {Id: 'BG', Name: 'Bulgaria'}, {Id: 'BF', Name: 'Burkina Faso'}, {Id: 'BI', Name: 'Burundi'}, {Id: 'KH', Name: 'Cambodia'}, {Id: 'CM', Name: 'Cameroon'}, {Id: 'CA', Name: 'Canada'}, {Id: 'CV', Name: 'Cape Verde'}, {Id: 'KY', Name: 'Cayman Islands'}, {Id: 'CF', Name: 'Central African Republic'}, {Id: 'TD', Name: 'Chad'}, {Id: 'CL', Name: 'Chile'}, {Id: 'CN', Name: 'China'}, {Id: 'CO', Name: 'Colombia'}, {Id: 'KM', Name: 'Comoros'}, {Id: 'CR', Name: 'Costa Rica'}, {Id: 'HR', Name: 'Croatia'}, {Id: 'CU', Name: 'Cuba'}, {Id: 'CY', Name: 'Cyprus'}, {Id: 'CZ', Name: 'Czechia'}, {Id: 'CD', Name: 'Democratic Republic of the Congo'}, {Id: 'DK', Name: 'Denmark'}, {Id: 'DJ', Name: 'Djibouti'}, {Id: 'DM', Name: 'Dominica'}, {Id: 'DO', Name: 'Dominican Republic'}, {Id: 'TL', Name: 'East Timor'}, {Id: 'EC', Name: 'Ecuador'}, {Id: 'EG', Name: 'Egypt'}, {Id: 'SV', Name: 'El Salvador'}, {Id: 'GQ', Name: 'Equatorial Guinea'}, {Id: 'ER', Name: 'Eritrea'}, {Id: 'EE', Name: 'Estonia'}, {Id: 'ET', Name: 'Ethiopia'}, {Id: 'FO', Name: 'Faroe Islands'}, {Id: 'FJ', Name: 'Fiji'}, {Id: 'FI', Name: 'Finland'}, {Id: 'FR', Name: 'France'}, {Id: 'GF', Name: 'French Guiana'}, {Id: 'PF', Name: 'French Polynesia'}, {Id: 'TF', Name: 'French Southern Territories'}, {Id: 'GA', Name: 'Gabon'}, {Id: 'GM', Name: 'Gambia'}, {Id: 'GE', Name: 'Georgia'}, {Id: 'DE', Name: 'Germany'}, {Id: 'GH', Name: 'Ghana'}, {Id: 'GR', Name: 'Greece'}, {Id: 'GL', Name: 'Greenland'}, {Id: 'GD', Name: 'Grenada'}, {Id: 'GP', Name: 'Guadeloupe'}, {Id: 'GU', Name: 'Guam'}, {Id: 'GT', Name: 'Guatemala'}, {Id: 'GG', Name: 'Guernsey'}, {Id: 'GN', Name: 'Guinea'}, {Id: 'GW', Name: 'Guinea-Bissau'}, {Id: 'GY', Name: 'Guyana'}, {Id: 'HT', Name: 'Haiti'}, {Id: 'HN', Name: 'Honduras'}, {Id: 'HK', Name: 'Hong Kong'}, {Id: 'HU', Name: 'Hungary'}, {Id: 'IS', Name: 'Iceland'}, {Id: 'IN', Name: 'India'}, {Id: 'ID', Name: 'Indonesia'}, {Id: 'IR', Name: 'Iran'}, {Id: 'IQ', Name: 'Iraq'}, {Id: 'IE', Name: 'Ireland'}, {Id: 'IM', Name: 'Isle of Man'}, {Id: 'IL', Name: 'Israel'}, {Id: 'IT', Name: 'Italy'}, {Id: 'CI', Name: 'Ivory Coast'}, {Id: 'JM', Name: 'Jamaica'}, {Id: 'JP', Name: 'Japan'}, {Id: 'JE', Name: 'Jersey'}, {Id: 'JO', Name: 'Jordan'}, {Id: 'KZ', Name: 'Kazakhstan'}, {Id: 'KE', Name: 'Kenya'}, {Id: 'KI', Name: 'Kiribati'}, {Id: 'XK', Name: 'Kosovo'}, {Id: 'KW', Name: 'Kuwait'}, {Id: 'KG', Name: 'Kyrgyzstan'}, {Id: 'LA', Name: 'Laos'}, {Id: 'LV', Name: 'Latvia'}, {Id: 'LB', Name: 'Lebanon'}, {Id: 'LS', Name: 'Lesotho'}, {Id: 'LR', Name: 'Liberia'}, {Id: 'LY', Name: 'Libya'}, {Id: 'LI', Name: 'Liechtenstein'}, {Id: 'LT', Name: 'Lithuania'}, {Id: 'LU', Name: 'Luxembourg'}, {Id: 'MK', Name: 'Macedonia'}, {Id: 'MG', Name: 'Madagascar'}, {Id: 'MW', Name: 'Malawi'}, {Id: 'MY', Name: 'Malaysia'}, {Id: 'MV', Name: 'Maldives'}, {Id: 'ML', Name: 'Mali'}, {Id: 'MT', Name: 'Malta'}, {Id: 'MH', Name: 'Marshall Islands'}, {Id: 'MQ', Name: 'Martinique'}, {Id: 'MR', Name: 'Mauritania'}, {Id: 'MU', Name: 'Mauritius'}, {Id: 'YT', Name: 'Mayotte'}, {Id: 'MX', Name: 'Mexico'}, {Id: 'FM', Name: 'Micronesia'}, {Id: 'MD', Name: 'Moldova'}, {Id: 'MC', Name: 'Monaco'}, {Id: 'MN', Name: 'Mongolia'}, {Id: 'ME', Name: 'Montenegro'}, {Id: 'MS', Name: 'Montserrat'}, {Id: 'MA', Name: 'Morocco'}, {Id: 'MZ', Name: 'Mozambique'}, {Id: 'MM', Name: 'Myanmar'}, {Id: 'NA', Name: 'Namibia'}, {Id: 'NR', Name: 'Nauru'}, {Id: 'NP', Name: 'Nepal'}, {Id: 'NL', Name: 'Netherlands'}, {Id: 'NC', Name: 'New Caledonia'}, {Id: 'NZ', Name: 'New Zealand'}, {Id: 'NI', Name: 'Nicaragua'}, {Id: 'NE', Name: 'Niger'}, {Id: 'NG', Name: 'Nigeria'}, {Id: 'KP', Name: 'North Korea'}, {Id: 'MP', Name: 'Northern Mariana Islands'}, {Id: 'NO', Name: 'Norway'}, {Id: 'OM', Name: 'Oman'}, {Id: 'PK', Name: 'Pakistan'}, {Id: 'PW', Name: 'Palau'}, {Id: 'PS', Name: 'Palestinian Territory'}, {Id: 'PA', Name: 'Panama'}, {Id: 'PG', Name: 'Papua New Guinea'}, {Id: 'PY', Name: 'Paraguay'}, {Id: 'PE', Name: 'Peru'}, {Id: 'PH', Name: 'Philippines'}, {Id: 'PL', Name: 'Poland'}, {Id: 'PT', Name: 'Portugal'}, {Id: 'PR', Name: 'Puerto Rico'}, {Id: 'QA', Name: 'Qatar'}, {Id: 'CG', Name: 'Republic of the Congo'}, {Id: 'RE', Name: 'Reunion'}, {Id: 'RO', Name: 'Romania'}, {Id: 'RU', Name: 'Russia'}, {Id: 'RW', Name: 'Rwanda'}, {Id: 'SH', Name: 'Saint Helena'}, {Id: 'KN', Name: 'Saint Kitts and Nevis'}, {Id: 'LC', Name: 'Saint Lucia'}, {Id: 'PM', Name: 'Saint Pierre and Miquelon'}, {Id: 'VC', Name: 'Saint Vincent and the Grenadines'}, {Id: 'WS', Name: 'Samoa'}, {Id: 'SM', Name: 'San Marino'}, {Id: 'ST', Name: 'Sao Tome and Principe'}, {Id: 'SA', Name: 'Saudi Arabia'}, {Id: 'SN', Name: 'Senegal'}, {Id: 'RS', Name: 'Serbia'}, {Id: 'SC', Name: 'Seychelles'}, {Id: 'SL', Name: 'Sierra Leone'}, {Id: 'SG', Name: 'Singapore'}, {Id: 'SK', Name: 'Slovakia'}, {Id: 'SI', Name: 'Slovenia'}, {Id: 'SB', Name: 'Solomon Islands'}, {Id: 'SO', Name: 'Somalia'}, {Id: 'ZA', Name: 'South Africa'}, {Id: 'KR', Name: 'South Korea'}, {Id: 'SS', Name: 'South Sudan'}, {Id: 'ES', Name: 'Spain'}, {Id: 'LK', Name: 'Sri Lanka'}, {Id: 'SD', Name: 'Sudan'}, {Id: 'SR', Name: 'Suriname'}, {Id: 'SJ', Name: 'Svalbard and Jan Mayen'}, {Id: 'SZ', Name: 'Swaziland'}, {Id: 'SE', Name: 'Sweden'}, {Id: 'CH', Name: 'Switzerland'}, {Id: 'SY', Name: 'Syria'}, {Id: 'TW', Name: 'Taiwan'}, {Id: 'TJ', Name: 'Tajikistan'}, {Id: 'TZ', Name: 'Tanzania'}, {Id: 'TH', Name: 'Thailand'}, {Id: 'TG', Name: 'Togo'}, {Id: 'TK', Name: 'Tokelau'}, {Id: 'TO', Name: 'Tonga'}, {Id: 'TT', Name: 'Trinidad and Tobago'}, {Id: 'TN', Name: 'Tunisia'}, {Id: 'TR', Name: 'Turkey'}, {Id: 'TM', Name: 'Turkmenistan'}, {Id: 'TV', Name: 'Tuvalu'}, {Id: 'VI', Name: 'U.S. Virgin Islands'}, {Id: 'UG', Name: 'Uganda'}, {Id: 'UA', Name: 'Ukraine'}, {Id: 'AE', Name: 'United Arab Emirates'}, {Id: 'GB', Name: 'United Kingdom'}, {Id: 'US', Name: 'United States'}, {Id: 'UY', Name: 'Uruguay'}, {Id: 'UZ', Name: 'Uzbekistan'}, {Id: 'VU', Name: 'Vanuatu'}, {Id: 'VE', Name: 'Venezuela'}, {Id: 'VN', Name: 'Vietnam'}, {Id: 'WF', Name: 'Wallis and Futuna'}, {Id: 'YE', Name: 'Yemen'}, {Id: 'ZM', Name: 'Zambia'}, {Id: 'ZW', Name: 'Zimbabwe'}];

	$('#' + this.bindings[0].id + '_id').val('');

	response($.map(countries, function (country) {

		if (request.term == null ||
		   (request.term.length <= 2 && request.term.toLowerCase().search(country.Id.toLowerCase()) >= 0) ||
		   (country.Name.toLowerCase().search(request.term.toLowerCase()) >= 0))
				return {
					label: country.Name,
					value: country.Name,
					id: country.Id}
			}));

}

function AutocompleteCountrySelect(event, ui) {
	$('#' + this.id + '_id').val(ui.item.id);
}

function NumberToString(n, digits) {

	if (digits === undefined) {
		return n.toLocaleString();
	} else {
		return n.toLocaleString(undefined, {minimumFractionDigits: digits, maximumFractionDigits: digits})
	}

}

function StringToNumber(s) {
	var txt = s.toString();

	if (txt == null || txt.length == 0) {
		return 0;
	}

	if (UserDecimalSeparator() == '.') {
		txt = txt.replace(',', '');
	} else {
		txt = txt.replace('.', '').replace(',', '.');
	}

	if ($.isNumeric(txt)) {
		return parseFloat(txt);
	} else {
		return 0;
	}

}

function UserDecimalSeparator() {
    var n = 1.1;
    n = n.toLocaleString().substring(1, 2);
    return n;
}

function SetDatePickerFormat(e) {

	e.datepicker({dateFormat: 'dd/mm/yy',
					showButtonPanel: true,
					changeMonth: true,
					changeYear: true,
					showWeek: true,
					firstDay: 1});

	e.prop('readonly', true);

	e.on('change', function() {
		$(this).val();
	});

}

function SortArray(array, field){

	array.sort(function(a,b){

		if (a[field] > b[field]) {
			return 1;
		}
		if (a[field] < b[field]) {
			return -1;
		}
		return 0;
	});

}

function SortArrayDesc(array, field){
	
	array.sort(function(a,b){

		if (a[field] < b[field]) {
			return 1;
		}
		if (a[field] > b[field]) {
			return -1;
		}
		return 0;
	});

}