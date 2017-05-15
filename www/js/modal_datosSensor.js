var BANDERA_TAB=false;

$(document).ready(function() {
	$("#ModalPage3").load("html_parts/modal_cargando.html");
	$("#btn_buscarGrafico").prop('disabled', true);
		
		$("#btn_buscarGrafico").click(function(e) {
			e.preventDefault();
			$("#btnValidar").trigger("click");
			if(formularioBusqueda.checkValidity())
			{
				$('#DivInicioOp').attr('class','form-group');
				$('#DivTerminoOp').attr('class','form-group');
					
				var ValOp=ValidarFechasOperaciones();
				if(ValOp=="ok"){
					//guardar_registro();
					$('#DivInicioOp').attr('class','form-group');
					$('#DivTerminoOp').attr('class','form-group');
						
					//CARGANDO DATOS
					$("#TablaDatosSensores").dataTable().fnDestroy();
					$("#tBodyDatosGrafico").html("");
					$("#TablaDatosAlarmas").dataTable().fnDestroy();
					$("#tBodyDatosAlarmas").html("");
					CargarDatos($('#inicio_filtroDatosSensor').val(),$('#termino_filtroDatosSensor').val());
				}else
				{
					if(ValOp=="intervalo")
					{
						$('#DivInicioOp').attr('class','form-group has-error');
						$('#DivTerminoOp').attr('class','form-group has-error');
						alert("La fecha de termino de operaciones("+$('#termino_filtroDatosSensor').val()+") es menor a la fecha de inicio de operaciones("+$('#inicio_filtroDatosSensor').val()+")");
					}
					if(ValOp=="exceso")
					{
						$('#DivInicioOp').attr('class','form-group has-error');
						$('#DivTerminoOp').attr('class','form-group has-error');
						alert("La diferencia de dias excede los 7 dias");
					}
				}
			}
		});
		
		$("#btnGrabarBitacora").click(function(e) { 
			$("#btnValidarIngresoBitacora").trigger("click");
			if(formularioIngresoBitacora.checkValidity()){
				GuardarBitacora();
			}
		});
		
	
		$("#inicio_filtroDatosSensor").datepicker({
									format: "dd/mm/yyyy",
									language:"es",
									autoclose:true,
									orientation: "top auto"
									});
		$("#termino_filtroDatosSensor").datepicker({ format: "dd/mm/yyyy",
									language:"es",
									autoclose:true,
									orientation: "top auto"
									});
});
function CrearCuerpoTablaAlarmas(json)
{
	var CuerpoAlarmas='';
	$.each(json, function(i, d) {
		CuerpoAlarmas+='<tr style="text-align: center; cursor:pointer" onclick="javascript:CargarBitacora('+d.Id_alerta+');">';
		CuerpoAlarmas+='<td width="38%">'+d.Id_alerta+'</td>';
		CuerpoAlarmas+='<td><span style="display:none">'+d.Fecha_Numerica+'</span>'+d.Fecha_Hora+'</td>';
		CuerpoAlarmas+='<td width="20%">'+d.TipoAlerta+'</td>';
		if($('#H_TIPO_MODELO').val() == "5")
		{
			if(d.TipoAlerta=="AC" || d.TipoAlerta=="DC")
			{
				CuerpoAlarmas+='<td width="9%"><label class="LabelAlarma">'+d.temperatura+'</label></td>';
			}
			else
			{
				CuerpoAlarmas+='<td width="9%">'+d.temperatura+'</td>';
			}
		}
		else
		{
			CuerpoAlarmas+='<td width="9%">'+d.temperatura+'</td>';
		}
		//Si es tipo temperatura humedad
		if($('#H_TIPO_MODELO').val() == "5")
		{
			if(d.TipoAlerta=="H1" || d.TipoAlerta=="H2")
			{
				CuerpoAlarmas+='<td width="9%"><label class="LabelAlarma">'+d.humedad+'</label></td>';
			}
			else
			{
				CuerpoAlarmas+='<td width="9%">'+d.humedad+'</td>';
			}
		}
		else
		{
			CuerpoAlarmas+='<td width="9%" style="display:none">'+d.humedad+'</td>';
		}
				
		CuerpoAlarmas+='</tr>';
	});
	return CuerpoAlarmas;
}
function getIconoTendencia(TENDENCIA)
{
	var IconoTendencia="";
	if(TENDENCIA=="=")
	{
		IconoTendencia='<i class="glyphicon glyphicon-minus-sign" style="color: #f0ad4e"></i>';
	}
	if(TENDENCIA=="-")
	{
		IconoTendencia='<i class="glyphicon glyphicon-circle-arrow-down" style="color: #5cb85c"></i>';
	}
	if(TENDENCIA=="+")
	{
		IconoTendencia='<i class="glyphicon glyphicon-circle-arrow-up" style="color: #d9534f"></i>';
	}
	return IconoTendencia;
}
function DesabilitarBusqueda()
{
	$('#inicio_filtroDatosSensor').prop("disabled",true);
	$('#termino_filtroDatosSensor').prop("disabled",true);
	$('#btn_buscarGrafico').prop("disabled",true);
}
function HabilitarBusqueda()
{
	$('#inicio_filtroDatosSensor').prop("disabled",false);
	$('#termino_filtroDatosSensor').prop("disabled",false);
	$('#btn_buscarGrafico').prop("disabled",false);
}
function CargarGrafico(e)
{
	e.preventDefault();
	if($("#H_TabActivo").val()!="Grafico")
	{
		if(!BANDERA_TAB)
		{
			$("#H_TabActivo").val("Grafico");
			$('#GraficoSensor-tab').tab('show');
			if($("#H_TAB_GRAFICO_CARGADO").val()!="ok")
			{
				setTimeout(function () {
					CrearGraficoInicial();
				}, 500);
				
			}
		}
	}
}
function CargarDatosGrafico(e)
{
	e.preventDefault();
	if($("#H_TabActivo").val()!="Datos")
	{
		//Validar si ya esta cargado
		if($("#H_TAB_DATOS_CARGADO").val()=="Ok" && !BANDERA_TAB)
		{
			$("#H_TabActivo").val("Datos");
			$('#Tabla_datos-tab').tab('show');
		}
		else
		{
			//Si aun se estan cargando datos
			if(!BANDERA_TAB)
			{
				$("#H_TabActivo").val("Datos");
				$('#Tabla_datos-tab').tab('show');
				$("#DivCargandoDatos").show();
				CargarTabDatos();
			}
		}
	}
}
function CargarTabDatos()
{
	BANDERA_TAB=true;
	DesabilitarBusqueda();
	$("#H_TAB_DATOS_CARGADO").val("");
	$("#H_TAB_DATOS_CARGADO").val("");
		
	var CuerpoDatos='';
	var IconoTendencia='';
	
	//alert($("#JSON_DATOS").html());
	
	var json = jQuery.parseJSON($("#JSON_DATOS").html());
	
	//Si no es humedad
	if($("#H_TIPO_MODELO").val()!="5")
	{
		$.each(json, function(j, e) {
			$.each(e.JSON_DATOS, function(i, d) {
				CuerpoDatos+='<tr>';
				CuerpoDatos+='<td><center>'+d.FECHA_HORA+'</center></td>';
				CuerpoDatos+='<td><center>'+d.TEMPERATURA+'</center></td>';	
				CuerpoDatos+='<td width="49%"><center>'+getIconoTendencia(d.TENDENCIA+'')+'</center><span style="display:none">'+d.TENDENCIA+'</span></td>';
				CuerpoDatos+='<td style=display:none><center></center></td>';	
				CuerpoDatos+='<td style=display:none><center></center></td>';	
				CuerpoDatos+='</tr>';
			});
		});
	}
	
	//Sensores HUMEDAD
	if($("#H_TIPO_MODELO").val()=="5")
	{
		$.each(json, function(j, e) {
			
			$("#ThHumedad").show();
			$("#ThTendenciaHumedad").show();
						
			var celda=0;
			
			$.each(e.JSON_DATOS_TEMPERATURA_HUMEDAD, function(i, d) {
					CuerpoDatos+='<tr>';
					CuerpoDatos+='<td><center>'+d.fechaHora+'</center></td>';
					CuerpoDatos+='<td><center>'+d.temperatura+'</center></td>';
					CuerpoDatos+='<td width="29%"><center>'+getIconoTendencia(d.temperatura_tendencia+'')+'</center><span style="display:none">'+d.temperatura_tendencia+'</span></td>';
					CuerpoDatos+='<td><center>'+d.humedad+'</center></td>';
					CuerpoDatos+='<td><center>'+getIconoTendencia(d.humedad_tendencia+'')+'</center></td>';
					CuerpoDatos+='</tr>';
			});
		});
	}
			
	$("#tBodyDatosGrafico").html(CuerpoDatos);
	$("#DivCargandoDatos").hide("fade");
					
	setTimeout(function () {
		$("#DivTablaDatos").show("fade");				
		$("#TablaDatosSensores").dataTable({
			"language": {
				"url": "json/spanish.json"
			},
			"scrollY":        "230px",
			"scrollCollapse": true,
			"paging":         false,
			"searching": false,
			"order": [[ 0, "desc" ]]
		});
		BANDERA_TAB=false;
		setTimeout(function () {
			RecargarTablaDatos();
			}, 250);
	}, 500);
			
	$("#H_TAB_DATOS_CARGADO").val("Ok");
	HabilitarBusqueda();
}
function CargarAlarmas(e)
{
		e.preventDefault();
		if($("#H_TabActivo").val()!="Alarmas")
		{
			//Validar si ya esta cargado
			if($("#H_TAB_ALARMAS_CARGADO").val()=="Ok" && !BANDERA_TAB)
			{
				$("#H_TabActivo").val("Alarmas");
				$('#Tabla_alarmas-tab').tab('show');
			}
			else
			{
				//Si aun se estan cargando datos
				if(!BANDERA_TAB)
				{
					$("#H_TabActivo").val("Alarmas");
					$('#Tabla_alarmas-tab').tab('show');
					$("#DivCargandoAlarmas").show();
					CargarTabAlarmas();
				}
			}
		}
}
function CargarTabAlarmas()
{
	BANDERA_TAB=true;
	DesabilitarBusqueda();
	$("#H_TAB_ALARMAS_CARGADO").val("");
		
	var CuerpoAlarmas='';
	
	//Buscar datos bitacora						
	$.post(RUTACONTROL,{
				accion 		 : 'CargarAlarmas',
				ID_CLIENTE   : $('#H_ID_CLIENTE_ACTUAL').val(),
				ID_SUCURSAL  : $('#H_ID_SUCURSAL_ACTUAL').val(),
				ID_SECCION   : $('#H_ID_SECCION').val(),
				ID_EQUIPO    : $('#H_ID_EQUIPO').val(),
				ID_SENSOR    : $('#H_ID_SENSOR').val(),
				FECHAINICIO	 : $('#inicio_filtroDatosSensor').val(),
				FECHATERMINO : $('#termino_filtroDatosSensor').val()
		}, 
	function(response) {				
			var json = jQuery.parseJSON(response);
			
			if($('#H_TIPO_MODELO').val()=="5")
			{
				$('#Th_HMD').show();
			}
			
			CuerpoAlarmas=CrearCuerpoTablaAlarmas(json);
			
			$("#tBodyDatosAlarmas").html(CuerpoAlarmas);
			$("#DivCargandoAlarmas").hide("fade");
					
	}).done(function(response) {					
		setTimeout(function () {
			$("#DivTablaAlarmas").show("fade");			
			
			$("#TablaDatosAlarmas").dataTable({
				"language": {
					"url": "json/spanish.json"
				},
				"scrollY":        "230px",
				"scrollCollapse": true,
				"paging":         false,
				"searching": false,
				"order": [[ 0, "desc" ]]
			});
			BANDERA_TAB=false;
			setTimeout(function () {
				RecargarTablaAlarmas();
			}, 250);
		}, 500);
			
		$("#H_TAB_ALARMAS_CARGADO").val("Ok");
		HabilitarBusqueda();
		
	});
}
function CargaOKEXCEL(RutaArchivo)
{	
	$("#link_descargaArchivoDatosSensor").attr("href","excel/archivos_creados/"+RutaArchivo);
}
function CargarDatos(Inicio,Termino)
{
	var VistaTab=$("#H_TabActivo").val();		
		
	$("#H_TAB_GRAFICO_CARGADO").val("");
	$("#H_TAB_ALARMAS_CARGADO").val("");
	$("#H_TAB_DATOS_CARGADO").val("");
		
	if(VistaTab=="Grafico")
	{
			//Mostrando cargando
			BANDERA_TAB=true;
			$("#DivGraficoLineal").hide();
			$("#DivCargandoGrafico").show("fade");
			
			//Fecha inicio
			var FecIni=Inicio;
			var fecha_inicio=FecIni.substring(6, 10)+'-'+FecIni.substring(3, 5)+'-'+FecIni.substring(0, 2);			
			$('#inicio_filtroDatosSensor').datepicker("setDate", new Date(parseInt(FecIni.substring(6, 10)),parseInt(FecIni.substring(3, 5))-1,parseInt(FecIni.substring(0, 2))));
				
			//Fecha termino
			var FecTerm=Termino;
			var fecha_termino=FecTerm.substring(6, 10)+'-'+FecTerm.substring(3, 5)+'-'+FecTerm.substring(0, 2);
			$('#termino_filtroDatosSensor').datepicker("setDate", new Date(parseInt(FecTerm.substring(6, 10)),parseInt(FecTerm.substring(3, 5))-1,parseInt(FecTerm.substring(0, 2))));
			
			var CuerpoAlarmas='';
			//Se cargara el grafico al JSON
			$.post(RUTACONTROL,{
					accion 		 	: 'DatosGraficoSensorTermico',
					IdCliente		: $('#H_ID_CLIENTE_ACTUAL').val(),
					IdSucursal		: $('#H_ID_SUCURSAL_ACTUAL').val(),
					IdSeccion		: $('#H_ID_SECCION').val(),
					IdEquipo		: $('#H_ID_EQUIPO').val(),
					IdSensor		: $('#H_ID_SENSOR').val(),
					fecha_inicio    : fecha_inicio,
					fecha_termino   : fecha_termino,
					TipoModelo    	: $('#H_TIPO_MODELO').val()
			}, 
			function(response) {
				$("#JSON_DATOS").html(response);
				$("#DivGraficoLineal").show("fade");
				$("#DivCargandoGrafico").hide();
			}).done(function(response) {
				CrearGraficoInicial();
				BANDERA_TAB=false;
			});
	}
	if(VistaTab=="Datos")
	{
			//Mostrando cargando
			BANDERA_TAB=true;
			$("#DivTablaDatos").hide();
			$("#DivCargandoDatos").show("fade");
			
			//Fecha inicio
			var FecIni=Inicio;
			var fecha_inicio=FecIni.substring(6, 10)+'-'+FecIni.substring(3, 5)+'-'+FecIni.substring(0, 2);			
			$('#inicio_filtroDatosSensor').datepicker("setDate", new Date(parseInt(FecIni.substring(6, 10)),parseInt(FecIni.substring(3, 5))-1,parseInt(FecIni.substring(0, 2))));
				
			//Fecha termino
			var FecTerm=Termino;
			var fecha_termino=FecTerm.substring(6, 10)+'-'+FecTerm.substring(3, 5)+'-'+FecTerm.substring(0, 2);
			$('#termino_filtroDatosSensor').datepicker("setDate", new Date(parseInt(FecTerm.substring(6, 10)),parseInt(FecTerm.substring(3, 5))-1,parseInt(FecTerm.substring(0, 2))));
			
			var CuerpoAlarmas='';
			//Se cargara el grafico al JSON
			$.post(RUTACONTROL,{
					accion 		 	: 'DatosGraficoSensorTermico',
					IdCliente		: $('#H_ID_CLIENTE_ACTUAL').val(),
					IdSucursal		: $('#H_ID_SUCURSAL_ACTUAL').val(),
					IdSeccion		: $('#H_ID_SECCION').val(),
					IdEquipo		: $('#H_ID_EQUIPO').val(),
					IdSensor		: $('#H_ID_SENSOR').val(),
					fecha_inicio    : fecha_inicio,
					fecha_termino   : fecha_termino,
					TipoModelo    	: $('#H_TIPO_MODELO').val()
					}, 
			function(response) {
				$("#JSON_DATOS").html(response);
				$("#TablaDatosSensores").dataTable().fnDestroy();
				$("#tBodyDatosGrafico").html("");
				$("#DivTablaDatos").show("fade");
				$("#DivCargandoDatos").hide();
			}).done(function(response) {
				CargarTabDatos();
			});
	}
	if(VistaTab=="Alarmas")
	{
			//Mostrando cargando
			BANDERA_TAB=true;
			$("#DivTablaAlarmas").hide();
			$("#DivCargandoAlarmas").show("fade");			
			
			$("#TablaDatosAlarmas").dataTable().fnDestroy();
			$("#tBodyDatosAlarmas").html("");
			
			DesabilitarBusqueda();
			$("#H_TAB_ALARMAS_CARGADO").val("");
			
			var CuerpoAlarmas='';
			
			//Buscar datos bitacora						
			$.post(RUTACONTROL,{
					accion 		 : 'CargarAlarmas',
					ID_CLIENTE   : $('#H_ID_CLIENTE_ACTUAL').val(),
					ID_SUCURSAL  : $('#H_ID_SUCURSAL_ACTUAL').val(),
					ID_SECCION   : $('#H_ID_SECCION').val(),
					ID_EQUIPO    : $('#H_ID_EQUIPO').val(),
					ID_SENSOR    : $('#H_ID_SENSOR').val(),
					FECHAINICIO	 : $('#inicio_filtroDatosSensor').val(),
					FECHATERMINO : $('#termino_filtroDatosSensor').val()
					}, 
			function(response) {				
				var json = jQuery.parseJSON(response);
				
				CuerpoAlarmas=CrearCuerpoTablaAlarmas(json);
				
				$("#tBodyDatosAlarmas").html(CuerpoAlarmas);
				$("#DivCargandoAlarmas").hide("fade");
						
			}).done(function(response) {						
				setTimeout(function () {
					$("#DivTablaAlarmas").show("fade");		
					$("#TablaDatosAlarmas").dataTable({
						"language": {
							"url": "json/spanish.json"
						},
						"scrollY":        "230px",
						"scrollCollapse": true,
						"paging":         false,
						"searching": false,
						"order": [[ 0, "desc" ]]
					});
					BANDERA_TAB=false;
					setTimeout(function () {
						RecargarTablaAlarmas();
					}, 250);
				}, 500);
				
				$("#H_TAB_ALARMAS_CARGADO").val("Ok");
				HabilitarBusqueda();
			});
			
	}
}
	function CrearGraficoInicial()
	{
		var optionsLineal;
	
		var json = jQuery.parseJSON($("#JSON_DATOS").html());
		optionsLineal=GenerarGraficoSensor(json);
		
		var chart = new Highcharts.Chart(optionsLineal);
		$('#btn_buscarGrafico').prop("disabled",false);
		$("#Li_TablaAlarmas").show("fade");
		$("#Li_Tabla").show("fade");
		$("#H_TAB_GRAFICO_CARGADO").val("ok");	
	}
function CargarBitacora(Id_alerta)
{
	$("#H_ID_ALERTA").val(Id_alerta);
	$("#DivBitacora").hide("blind");
	$("#DivCargandoBitacora").show("blind");
	//Buscar datos bitacora						
	$.post(RUTACONTROL,{
			accion 		 : 'CargarBitacora',
			ID_CLIENTE   : $('#H_ID_CLIENTE_ACTUAL').val(),
			ID_SUCURSAL  : $('#H_ID_SUCURSAL_ACTUAL').val(),
			ID_SECCION   : $('#H_ID_SECCION').val(),
			ID_EQUIPO    : $('#H_ID_EQUIPO').val(),
			ID_SENSOR    : $('#H_ID_SENSOR').val(),
			ID_ALERTA	 : Id_alerta
			}, 
	function(response) {	
		$("#DivCargandoBitacora").hide("blind");
		
		var json = jQuery.parseJSON(response);
			
		var CantidadBitacoras='0';
		var ContenidoBitacoras='';									
		
		$.each(json, function(i, d) {
			CantidadBitacoras=d.CANTIDAD_REGISTROS;
			
			ContenidoBitacoras+='<span class="list-group-item">';
			ContenidoBitacoras+='<h5 class="list-group-item-heading"><b>'+d.NOMBRE+' '+d.EMAIL+' - '+d.FECHAHORA+'</b></h5>';
			ContenidoBitacoras+='<h6 class="list-group-item-text">'+d.COMENTARIO+'</h6>';
			ContenidoBitacoras+='</span>';
		});
			
		$("#registros_bitacora").html(CantidadBitacoras);
		$("#DivContenidoDeBitacoras").html(ContenidoBitacoras);
		$("#tituloBitacora").html("Bitacora ("+$('#H_ID_ALERTA').val()+")");			
	}).done(function(response) {
		$("#DivBitacora").show("blind");
		$('html, body').animate({
			scrollTop: 100000
		}, 2000);
	});
}
function GuardarBitacora()
{		
	$("#DivBitacora").hide("blind");
	$("#DivCargandoBitacora").show("blind");		
	//Buscar datos bitacora						
	$.post(RUTACONTROL,{
				accion 		: 'GuardarBitacora',
				ID_ALERTA   : $('#H_ID_ALERTA').val(),
				COMENTARIO  : $('#txtcomentario_bitacora').val(),
				CK			: ''+getCookie('INGSCE_INF')
				}, 
	function(response) {			
		var json = jQuery.parseJSON(response);
			
		var CantidadBitacoras=parseInt($("#registros_bitacora").html());
		var ContenidoBitacoras='';
			
		$.each(json, function(i, d) {
			CantidadBitacoras++;
				
			ContenidoBitacoras+='<span class="list-group-item">';
			ContenidoBitacoras+='<h5 class="list-group-item-heading"><b>'+d.NOMBRE+' '+d.EMAIL+' - '+d.FECHAHORA+'</b></h5>';
			ContenidoBitacoras+='<h6 class="list-group-item-text">'+d.COMENTARIO+'</h6>';
			ContenidoBitacoras+='</span>';
		});					
			
		$("#registros_bitacora").html(CantidadBitacoras);
		$("#DivContenidoDeBitacoras").append(ContenidoBitacoras);
			
		$("#DivDatosBitacora").attr("class","panel-collapse collapse");
		$("#DivDatosBitacora").css("height"," height: 0px");
		$("#DivDatosBitacora").attr("aria-expanded","false");
			
		$("#txtcomentario_bitacora").val("");	
		//Buscar datos bitacora
	}).done(function(response) {
		$("#DivCargandoBitacora").hide("blind");	
		$("#DivBitacora").show("blind");
	});
}
function MostrarBitacora()
{
	$("#VerBitacora").trigger("click");
}
function RecargarTabla()
{
	var divProblemas=$('#PanelBodyTablaDatosSensor').find('.dataTables_scrollHeadInner');		
	$(divProblemas).css('width','100%');
		
	var tablefoot=$(divProblemas).find('table');
	$(tablefoot).css('margin-bottom','0');
		
	var tablaProblemas=$(divProblemas).find('table');
	$(tablaProblemas).css('width','100%');
		
	var divProblemas2=$('#PanelBodyTablaDatosAlarma').find('.dataTables_scrollHeadInner');		
	$(divProblemas2).css('width','100%');
	
	var tablaProblemas2=$(divProblemas2).find('table');
	$(tablaProblemas2).css('width','100%');
}
function ValidarFechasOperaciones()
{
	var Valido=false;
	var Respuesta="";
	
	var startDate = $('#inicio_filtroDatosSensor').val();
	startDate=String(startDate);
		
	//Convertiendo a float
	var anioIni=startDate.substring(6, 10);
	var mesIni=startDate.substring(3, 5);
	var diaIni=startDate.substring(0, 2);
		
	var FecIni = parseFloat(anioIni+mesIni+diaIni);
		
	var endDate = $('#termino_filtroDatosSensor').val();
	endDate=String(endDate);
		
	//Convertiendo a float
	var anioFin=endDate.substring(6, 10);
	var mesFin=endDate.substring(3, 5);
	var diaFin=endDate.substring(0, 2);
	
	var FecFin = parseFloat(anioFin+mesFin+diaFin);
		
	if(FecIni!=FecFin)
	{
		if(FecIni < FecFin){
		   Valido=true;
		   Respuesta="ok";
		}
		else
		{
			Respuesta="intervalo";
		}
	}
	else
	{
		Valido=true;
		Respuesta="ok";
	}
	if(Valido)
	{
		var Dif=FecFin-FecIni;
		if(Dif>7)
		{
			Valido=false;
			Respuesta="exceso";
		}
	}
		
	return Respuesta;
}
function RecargarTablaDatos()
{
	var divProblemas2 = $("#PanelBodyTablaDatosSensor").find(".dataTables_scrollHeadInner");
	$(divProblemas2).css('width','100%');
	
	var tablaProblemas2=$(divProblemas2).find('table');
	$(tablaProblemas2).css('width','100%');
	$(tablaProblemas2).attr('style','margin-left: 0px; width: 100%; margin-bottom: -2px;');
}
function RecargarTablaAlarmas()
{		
	var divProblemas2=$('#PanelBodyTablaDatosAlarma').find('.dataTables_scrollHeadInner');		
	$(divProblemas2).css('width','100%');
	
	var tablaProblemas2=$(divProblemas2).find('table');
	$(tablaProblemas2).css('width','100%');
	$(tablaProblemas2).attr('style','margin-left: 0px; width: 100%; margin-bottom: -2px;');
}
