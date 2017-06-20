var BANDERA_TAB=false;

$(document).ready(function() {
	$("#ModalPage3").load("html_parts/modal_cargando.html");
	$("#btn_buscarGrafico").prop('disabled', true);
	
	setTimeout(function () {
		CargarDatos($('#inicio_filtroSensorSoloPuerta').val(),$('#termino_filtroSensorSoloPuerta').val());
	}, 500);

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
					CargarDatos($('#inicio_filtroSensorSoloPuerta').val(),$('#termino_filtroSensorSoloPuerta').val());
				}else
				{
					if(ValOp=="ok"){
						//guardar_registro();
						$('#DivInicioOp').attr('class','form-group');
						$('#DivTerminoOp').attr('class','form-group');

						//GUARDANDO DATOS
						$("#TablaDatosSensores").dataTable().fnDestroy();
						$("#tBodyDatosGrafico").html("");
						CargarDatos($('#inicio_filtroSensorSoloPuerta').val(),$('#termino_filtroSensorSoloPuerta').val());
					}else
					{
						if(ValOp=="intervalo")
						{
							$('#DivInicioOp').attr('class','form-group has-error');
							$('#DivTerminoOp').attr('class','form-group has-error');
							alert("La fecha de termino de operaciones("+$('#termino_filtroSensorSoloPuerta').val()+") es menor a la fecha de inicio de operaciones("+$('#inicio_filtroSensorSoloPuerta').val()+")");
						}
						if(ValOp=="exceso")
						{
							$('#DivInicioOp').attr('class','form-group has-error');
							$('#DivTerminoOp').attr('class','form-group has-error');
							alert("La diferencia de dias excede los 7 dias");
						}
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


		$("#inicio_filtroSensorSoloPuerta").datepicker({
									format: "dd/mm/yyyy",
									language:"es",
									autoclose:true,
									orientation: "top auto"
									});
		$("#termino_filtroSensorSoloPuerta").datepicker({ format: "dd/mm/yyyy",
									language:"es",
									autoclose:true,
									orientation: "top auto"
									});
});
function RecargarTabla()
{
	var divProblemas=$('#PanelBodyTablaDatosSensor').find('.dataTables_scrollHeadInner');

	var tablaProblemas=$(divProblemas).find('table');

	var PrimeraCelda=$(tablaProblemas).find('.sorting_asc');
	//$(PrimeraCelda).trigger('click');
	//$(PrimeraCelda).trigger('click');

	$(divProblemas).css('width','100%');
	$(tablaProblemas).css('width','100%');
	$(tablaProblemas).css('margin-bottom','0px');
}
function ValidarFechasOperaciones()
{
	var Valido=false;
	var Respuesta="";

	var startDate = $('#inicio_filtroSensorSoloPuerta').val();
	startDate=String(startDate);

	//Convertiendo a float
	var anioIni=startDate.substring(6, 10);
	var mesIni=startDate.substring(3, 5);
	var diaIni=startDate.substring(0, 2);

	var FecIni = parseFloat(anioIni+mesIni+diaIni);

	var endDate = $('#termino_filtroSensorSoloPuerta').val();
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
		var fechaInicio = new Date(anioIni+'-'+mesIni+'-'+diaIni+'').getTime();
		var fechaFin    = new Date(anioFin+'-'+mesFin+'-'+diaFin+'').getTime();

		var diff = fechaFin - fechaInicio;

		var Dif=diff/(1000*60*60*24);

		if(Dif>7)
		{
			Valido=false;
			Respuesta="exceso";
		}
	}
	return Respuesta;
}
function GenerarHTML(Datos)
{
	var CuerpoDatos='';
	var imagen='';
		
	for (i = 0; i < Datos.length; i++) {
		//Recorrer todos menos el ultimo
		if((i+1)!= Datos.length)
		{
			//Saber si es punultimo
			if((i+1)==(Datos.length-1))
			{
				CuerpoDatos+='<tr><td style="width: 19%"><center>'+Datos[i]['FechaHora']+'</center></td><td style="width: 21%">';
				
				if(Datos[i]['Estado']=='Closed')
				{
					imagen='<i style="color: #08fa06" class="fa fa-lock fa-lg"></i>';
				}
				else
				{
					imagen='<i style="color: #fd0002" class="fa fa-unlock fa-lg"></i>';
				}

					CuerpoDatos+='<center>'+imagen+'</center><span style="display:none">'+Datos[i]['Estado']+'</span></td>';
				}
				else
				{	
					//Registro normal
					CuerpoDatos+='<tr><td style="width: 19%"><center>'+Datos[i]['FechaHora']+'</center></td><td style="width: 21%">';
					
					if(Datos[i]['Estado']=='Closed')
					{
						imagen='<i style="color: #08fa06" class="fa fa-lock fa-lg"></i>';
					}
					else
					{
						imagen='<i style="color: #fd0002" class="fa fa-unlock fa-lg"></i>';
					}

					CuerpoDatos+='<center>'+imagen+'</center><span style="display:none">'+Datos[i]['Estado']+'</span></td>';

					CuerpoDatos+='<td style="width: 24%"><center>'+Datos[i]['Diferencia']+'</center></td>';
					CuerpoDatos+='</tr>';
				}
			}
			else
			{
				//Ultimo registro
				CuerpoDatos+='<td style="width: 24%"><center>'+Datos[i]['Diferencia']+'</center></td>';
				CuerpoDatos+='</tr>';
			}
		}
		
		return CuerpoDatos;
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
						CargarDatos($('#inicio_filtroSensorSoloPuerta').val(),$('#termino_filtroSensorSoloPuerta').val());
					}, 500);

				}
			}
		}
	}
	function CargarDatos(FechaInicio,FechaTermino)
	{
		var VistaTab=$("#H_TabActivo").val();
		
		if(VistaTab=="Grafico")
		{
			var CuerpoDatos='';
			var  Limite;
			var Promedio;

			$("#DivCargandoTablaGrafico").show();
			$("#IframeGrafico").css("height","0px");
			$("#DivCargandoGraficoIframe").show();

			$("#btn_buscarGrafico").prop('disabled', true);

			$("#H_FEC_INI").val(FechaInicio);
			$("#H_FEC_TERMINO").val(FechaTermino);
			
			if(FechaInicio!="")
			{
				FechaInicio=FechaInicio.substring(6, 10)+'-'+FechaInicio.substring(3, 5)+'-'+FechaInicio.substring(0, 2);
				FechaTermino=FechaTermino.substring(6, 10)+'-'+FechaTermino.substring(3, 5)+'-'+FechaTermino.substring(0, 2);
			}

			$.post(RUTACONTROL,{
				accion 		 : 'DatosSensorPuerta',
				ID_CLIENTE   : $('#H_ID_CLIENTE').val(),
				ID_SUCURSAL  : $('#H_ID_SUCURSAL').val(),
				ID_SECCION   : $('#H_ID_SECCION').val(),
				ID_EQUIPO  	 : $('#H_ID_EQUIPO').val(),
				fecha_inicio : FechaInicio,
				fecha_inicio : FechaTermino
			},
			function(response) {
				var json = jQuery.parseJSON(response);
				CuerpoDatos=GenerarHTML(json[0]['JSON_DATOS_PUERTA']);
				
				if(FechaInicio=="")
				{
					//Fecha inicio
					var FecIni=json[0]['FECHA_HOY'];
					$('#inicio_filtroSensorSoloPuerta').val(FecIni);
					$('#inicio_filtroSensorSoloPuerta').datepicker("setDate", new Date(parseInt(FecIni.substring(6, 10)),parseInt(FecIni.substring(3, 5))-1,parseInt(FecIni.substring(0, 2))));

					//Fecha Termino
					var FecTermino=json[0]['FECHA_HOY'];
					$('#termino_filtroSensorSoloPuerta').val(FecTermino);
					$('#termino_filtroSensorSoloPuerta').datepicker("setDate", new Date(parseInt(FecTermino.substring(6, 10)),parseInt(FecTermino.substring(3, 5))-1,parseInt(FecTermino.substring(0, 2))));
					
					$("#H_FEC_INI").val(json[0]['FECHA_HOY']);
					$("#H_FEC_TERMINO").val(json[0]['FECHA_HOY']);
				}

				$("#tBodyDatosGrafico").html(CuerpoDatos);
				$("#tbl_DataGra").html($("#PanelBodyTablaDatosSensor").html());
			})
			.done(function(response) {

				$("#DivCargandoTablaGrafico").hide();

				$("#TablaDatosSensores").dataTable({
					"scrollY":        "230px",
					"bInfo": false,
					"scrollCollapse": true,
					"paging":         false,
					"searching": false,
					"order": [[ 0, "desc" ]]
				});
				setTimeout(function () {
					RecargarTabla();
				}, 250);
				$("#btn_buscarGrafico").prop('disabled', false);
				$("#Li_TablaAlarmas").show("fade");
				$("#H_TAB_GRAFICO_CARGADO").val("ok");
				$("#H_TAB_ALARMAS_CARGADO").val("");
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
					ID_CLIENTE   : $('#H_ID_CLIENTE').val(),
					ID_SUCURSAL  : $('#H_ID_SUCURSAL').val(),
					ID_SECCION   : $('#H_ID_SECCION').val(),
					ID_EQUIPO    : $('#H_ID_EQUIPO').val(),
					ID_SENSOR    : $('#H_ID_SENSOR').val(),
					FECHAINICIO	 : $('#inicio_filtroSensorSoloPuerta').val(),
					FECHATERMINO : $('#termino_filtroSensorSoloPuerta').val()
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
						"scrollY":        "230px",
						"bInfo": false,
						"scrollCollapse": true,
						"paging":         false,
						"searching": false,
						"order": [[ 0, "desc" ]]
					});
					BANDERA_TAB=false;
				}, 500);

				$("#H_TAB_ALARMAS_CARGADO").val("Ok");
				$("#H_TAB_GRAFICO_CARGADO").val("");
				HabilitarBusqueda();
			});

		}
	}
	function CargarBitacora(Id_alerta)
	{
		$("#H_ID_ALERTA").val(Id_alerta);
		$("#DivBitacora").hide("blind");
		$("#DivCargandoBitacora").show("blind");
		//Buscar datos bitacora
		$.post(RUTACONTROL,{
				accion 		 : 'CargarBitacora',
				ID_CLIENTE   : $('#H_ID_CLIENTE').val(),
				ID_SUCURSAL  : $('#H_ID_SUCURSAL').val(),
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
			$("#ModalDialogGrafico").animate({
				scrollTop: $("#txtcomentario_bitacora").offset().top
			}, 2000);
		});
	}
	function GuardarBitacora()
	{
		$("#DivBitacora").hide("blind");
		$("#DivCargandoBitacora").show("blind");
		//Buscar datos bitacora
		$.post(RUTACONTROL,{
				accion 		 : 'GuardarBitacora',
				ID_ALERTA   : $('#H_ID_ALERTA').val(),
				COMENTARIO  : $('#txtcomentario_bitacora').val()
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
					$("#DivTablaAlarmas").hide();
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
		
		$("#TablaDatosAlarmas").dataTable().fnDestroy();
		$("#tBodyDatosAlarmas").html("");

		var CuerpoAlarmas='';

		//Buscar datos bitacora
		$.post(RUTACONTROL,{
				accion 		 : 'CargarAlarmas',
				ID_CLIENTE   : $('#H_ID_CLIENTE').val(),
				ID_SUCURSAL  : $('#H_ID_SUCURSAL').val(),
				ID_SECCION   : $('#H_ID_SECCION').val(),
				ID_EQUIPO    : $('#H_ID_EQUIPO').val(),
				ID_SENSOR    : $('#H_ID_SENSOR').val(),
				TIPO_MODELO  : $('#H_TIPO_MODELO').val(),
				FECHAINICIO	 : $('#inicio_filtroSensorSoloPuerta').val(),
				FECHATERMINO : $('#termino_filtroSensorSoloPuerta').val()
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
					"scrollY":        "230px",
					"bInfo": false,
					"scrollCollapse": true,
					"paging":         false,
					"searching": false,
					"order": [[ 0, "desc" ]]
				});
				BANDERA_TAB=false;
			}, 500);

			$("#H_TAB_ALARMAS_CARGADO").val("Ok");
			HabilitarBusqueda();
		});
	}
	function CrearCuerpoTablaAlarmas(json)
	{
		var CuerpoAlarmas='';
		$.each(json, function(i, d) {
			if($('#H_TIPO_MODELO').val() == "6")
			{
				CuerpoAlarmas+='<tr style="text-align: center; cursor:pointer" onclick="javascript:CargarBitacora('+d.Id_alerta+');">';
				CuerpoAlarmas+='<td width="38%">'+d.Id_alerta+'</td>';
				CuerpoAlarmas+='<td><span style="display:none">'+d.Fecha_Numerica+'</span>'+d.Fecha_Hora+'</td>';
				CuerpoAlarmas+='<td width="20%">'+d.TipoAlerta+'</td>';
				CuerpoAlarmas+='</tr>';
			}
		});
		return CuerpoAlarmas;
	}
	function DesabilitarBusqueda()
	{
		$('#inicio_filtroSensorSoloPuerta').prop("disabled",true);
		$('#termino_filtroSensorSoloPuerta').prop("disabled",true);
		$('#btn_buscarGrafico').prop("disabled",true);
	}
	function HabilitarBusqueda()
	{
		$('#inicio_filtroSensorSoloPuerta').prop("disabled",false);
		$('#termino_filtroSensorSoloPuerta').prop("disabled",false);
		$('#btn_buscarGrafico').prop("disabled",false);
	}