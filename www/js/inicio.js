var Colores=['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1','#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'];

Highcharts.setOptions({
	lang: {
		months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
		weekdays: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
		shortMonths: ['Ene' , 'Feb' , 'Mar' , 'Abr' , 'May' , 'Jun' , 'Jul' , 'Agost' , 'Sep' , 'Oct' , 'Nov' , 'Dic'],
		downloadJPEG:'Descargar JPEG',
		downloadPDF:'Descargar PDF',
		downloadPNG:'Descargar PNG',
		downloadSVG:'Descargar SVG',
		loading:'Cargando...',
		printChart:'Imprimir Gráfico',
		decimalPoint: ',',
		thousandsSep: '.',
		resetZoom: 'Restablecer'
	},
    colors: Colores
});

var chart;

$( document ).ready(function() {	
	
	setInterval(function(){ ParpadearAlarmaLocal(); }, 1000);
	
	$("#btn_Pruebas").click(function(e) {
		e.preventDefault();
	});
	$("#ModalPage2").load("html_parts/modal_cargando.html");
	
	document.addEventListener("backbutton", function(e){
    if($.mobile.activePage.is('#p2')){
        //e.preventDefault();
        navigator.app.exitApp();
    }}, false);
	
	if (window.history && window.history.pushState) {
		window.history.pushState('forward', null, '');
		$(window).on('popstate', function() {
			var pagina = $.mobile.activePage.attr('id');
			if(pagina=="p2")
			{
				window.history.forward(); 
			}
        });
    }
	var temporizadorDashboard;
	
	temporizadorDashboard=setInterval(function(){ActualizarDashboard()},180000);
});
function ScrollContenedor(Id_sensor)
{
	var AltMenu=$('#DivMenu').height();
	var TopContendor=$('#Contenedor_'+Id_sensor+'').offset().top;
	var NuevoScrollTop=TopContendor+AltMenu;
	
	NuevoScrollTop=NuevoScrollTop-55;
		
	$('html, body').animate({
		scrollTop: NuevoScrollTop
	}, 250);
}
function CargarGraficoSensorTermico(event,IdCliente,NombreCliente,IdSucursal,NombreSucursal,IdSeccion,NombreSeccion,IdEquipo,NombreEquipo,IdSensor)
{
	event.preventDefault();
	VerGraficoSensorTermico(false,IdCliente,NombreCliente,IdSucursal,NombreSucursal,IdSeccion,NombreSeccion,IdEquipo,NombreEquipo,IdSensor);
}
function CargarGraficoSensorElectrico(event,IdSensor,NombreEquipo)
{
	event.preventDefault();
	
	$('#ModalPage2').popup('open', {
		transition: 'pop'
	});
	$(window).disablescroll();
	
	$("#H_ID_SENSOR").val(IdSensor);
	
	$("#p3Body").load(
		"sensor.html",
	function() {
		$("#RowContenidoCuerpoP3").load(
			"html_parts/modal_datosSensorElectrico.html",
		function() {
			$('#H_SENSOR_ELECTRICO').val(IdSensor);
			$("#TituloModalGrafico").html(NombreEquipo+'('+IdSensor+')');
			
			var CuerpoDatos='';
			
				$.post(RUTACONTROL,{
								accion 		 : 'DatosGraficoSensorElectrico',
								ID_SENSOR    : IdSensor,
								FechaInicio  : '',	
								FechaTermino : ''
								}, 
				function(response) {
							var json = jQuery.parseJSON(response);
							
							$("#inicio_filtroDatosSensorElectrico").val(json['FECHA_HOY']);
							$("#termino_filtroDatosSensorElectrico").val(json['FECHA_HOY']);
							
							$.each(json.ITEMS, function(i, d) {
								CuerpoDatos+='<tr><td style="width: 19%"><center>'+d.HORA+'</center></td><td style="width: 21%">';
								
								var imagen='';
								if(d.ACCION=="Closed")
								{
									imagen='<i style="color: #08fa06" class="glyphicon glyphicon-off"></i>';
								}
								else
								{
									imagen='<i style="color: #fd0002" class="glyphicon glyphicon-off"></i>';
								}
								
								CuerpoDatos+='<center>'+imagen+'</center><span style="display:none">'+d.ACCION+'</span></td>';
								
								CuerpoDatos+='<td style="width: 24%"><center>'+d.TIEMPO_DE_USO+'</center></td>';
								CuerpoDatos+='</tr>';
							});
							
							$("#tBodyDatosGrafico").html(CuerpoDatos);

							$.mobile.pageContainer.pagecontainer('change', '#p3', {
								transition: 'flip',
								changeHash: true,
								reverse: true,
								showLoadMsg: false
							});
							
				}).done(function(response) {
					$('#ModalPage2').popup('close');
					$(window).disablescroll("undo");
					setTimeout(function () {
						$("#TablaDatosSensores").dataTable({
							"language": {
								"url": "json/spanish.json"
							},
							"scrollY":        "230px",
							"scrollCollapse": true,
							"paging":         false,
							"searching": false
						});
						$("#btn_buscarGrafico").prop('disabled', false);
						setTimeout(function () {
							RecargarTabla();
						},1000);
					}, 750);				
				});		
		});
	});
}
function CargarAlarmaSensor(Id_cliente,Razon_social,Id_sucursal,Nombre_sucursal,Id_seccion, Nombre_seccion, Id_equipo, Nombre_equipo,Id_sensor)
{
	$('#ModalPage2').popup('open', {
		transition: 'pop'
	});
	$(window).disablescroll();
	
	$("#H_ID_CLIENTE_ACTUAL").val(Id_cliente);
	$("#H_ID_SUCURSAL_ACTUAL").val(Id_sucursal);
	$("#H_ID_SECCION").val(Id_seccion);
	$("#H_ID_EQUIPO").val(Id_equipo);
	$("#H_ID_SENSOR").val(Id_sensor);
	
	$("#p3Body").load(
		"sensor.html",
	function() {
		$("#RowContenidoCuerpoP3").load(
			"html_parts/modal_alarmasSensor.html",
		function() {
			$('#H_SENSOR_ELECTRICO').val(Id_sensor);
			$("#TituloModalGrafico").html(Razon_social+' - '+Nombre_sucursal+' - '+Nombre_equipo+'('+Id_sensor+')');
			
			var CuerpoDatos='';

				$.post(RUTACONTROL,{
								accion 			 : 'UltimasAlarmas_Equipo_Sensor',
								ID_CLIENTE  	 : Id_cliente,
								RAZON_SOCIAL	 : Razon_social,	
								ID_SUCURSAL		 : Id_sucursal,
								NOMBRE_SUCURSAL	 : Nombre_sucursal,
								ID_SECCION		 : Id_seccion,
								NOMBRE_SECCION   : Nombre_seccion,
								ID_EQUIPO		 : Id_equipo,
								NOMBRE_EQUIPO	 : Nombre_equipo,
								ID_SENSOR		 : Id_sensor
								}, 
				function(response) {
							var json = jQuery.parseJSON(response);									
							$.each(json, function(i, d) {
								$("#FechaBitacoraHoy").html(d.FECHA_HOY);
								
								//Recorriendo alertas
								$.each(d.ALERTAS, function(j, e) {
									CuerpoDatos+='<tr style="text-align: center; cursor:pointer" onclick="javascript:CargarBitacora('+e.Id_alerta+');">';
									CuerpoDatos+='<td width="38%">'+e.Id_alerta+'</td>';
									CuerpoDatos+='<td><span style="display:none">'+e.Fecha_Numerica+'</span>'+e.Fecha_Hora+'</td>';
									CuerpoDatos+='<td width="20%">'+e.TipoAlerta+'</td>';
									CuerpoDatos+='<td width="9%">'+e.temperatura+'</td>';
									CuerpoDatos+='</tr>';
								});
							});
							$("#tBodyDatosAlarmas").html(CuerpoDatos);
							
							$.mobile.pageContainer.pagecontainer('change', '#p3', {
								transition: 'flip',
								changeHash: true,
								reverse: true,
								showLoadMsg: false
							});
							
							setTimeout(function () {
								if($('#H_CARGA_SENSOR').val()=="0")
								{
									$('#H_CARGA_SENSOR').val("1");
								}
								else
								{
									$('#p3').attr('style','padding-top: 0px; padding-bottom: 0px; min-height: 395px;');
								}
							}, 250);
							
				}).done(function(response) {
					$('#ModalPage2').popup('close');
					$(window).disablescroll("undo");
					setTimeout(function () {
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
						RecargarTablaAlarmas();
					}, 750);
				});		
		});
	});
}
function CargarTodasLasAlarmas(event)
{
	event.preventDefault();
	
	var CuerpoDatos='';	
	
	$('#ModalCargandoAlarma').popup('open', {
		transition: 'pop'
	});
	
	$('#TablaDatosAlarmas').dataTable().fnDestroy();
	$('#tBodyDatosAlarmas').html("");
	
	$.post(RUTACONTROL,{
						accion 			 : 'Alarmas_Equipo_Sensor',
						ID_CLIENTE  	 : $("#H_ID_CLIENTE_ACTUAL").val(),
						ID_SUCURSAL		 : $("#H_ID_SUCURSAL_ACTUAL").val(),
						ID_SECCION		 : $("#H_ID_SECCION").val(),
						ID_EQUIPO		 : $("#H_ID_EQUIPO").val(),
						ID_SENSOR		 : $("#H_ID_SENSOR").val()
	}, function(response) {
		var json = jQuery.parseJSON(response);									
			$.each(json, function(i, d) {
				$("#FechaBitacoraHoy").html(d.FECHA_HOY);
								
				//Recorriendo alertas
				$.each(d.ALERTAS, function(j, e) {
					CuerpoDatos+='<tr style="text-align: center; cursor:pointer" onclick="javascript:CargarBitacora('+e.Id_alerta+');">';
					CuerpoDatos+='<td width="38%">'+e.Id_alerta+'</td>';
					CuerpoDatos+='<td><span style="display:none">'+e.Fecha_Numerica+'</span>'+e.Fecha_Hora+'</td>';
					CuerpoDatos+='<td width="20%">'+e.TipoAlerta+'</td>';
					CuerpoDatos+='<td width="9%">'+e.temperatura+'</td>';
					CuerpoDatos+='</tr>';
				});
			});
			
		$("#tBodyDatosAlarmas").html(CuerpoDatos);
							
	}).done(function(response) {
		$(window).disablescroll("undo");
		setTimeout(function () {	
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
			RecargarTablaAlarmas();
			$('#ModalCargandoAlarma').popup('close');
		}, 750);
	});
}
function CerrarModalGrafico(event)
{
	event.preventDefault();
	$.mobile.pageContainer.pagecontainer('change', '#p2', {
				transition: 'flip',
				changeHash: false,
				reverse: false,
				showLoadMsg: false
	});
}
function ActualizarDashboard()
{
	var json;
	var EstadoSucursal='';
	var IconoSucursal='';
	
	$.post(RUTACONTROL,{
										accion		: 'ACTUALIZA_SENSORES',
										CK			: getCK(),
										ID_CLIENTE	: $('#H_ID_CLIENTE_ACTUAL').val(),
										ID_SUC		: $('#H_ID_SUCURSAL_ACTUAL').val()
									 }, 
			function(response) {
			
			json = jQuery.parseJSON(response);
			
			EstadoSucursal=''+json.ESTADO_SUCURSAL;
			IconoSucursal=''+json.ICONO_SUCURSAL;
			
	}).done(function(response) {
		$("#Estado_Sucursal").html(EstadoSucursal);
		$("#IconoSucursal").html(IconoSucursal);
		
		$.each(json.SENSORES, function(i, d) {
			
			$("#SENAL_"+d.IDSENSOR+"").html(d.SENAL);
			
			if(d.TIPO_SENSOR=="Termico")
			{
				if($.trim($("#Alarma_"+d.IDSENSOR+"").html())!=$.trim(d.ALARMA))
				{
					$("#Alarma_"+d.IDSENSOR+"").html(d.ALARMA);
					ParpadearActualizar("Alarma_"+d.IDSENSOR+"");
				}
				
				if($.trim(d.STATUS_EQUIPO)=='')
				{
					$('#IconoSensor_'+d.IDSENSOR+'').html('<i class="glyphicon glyphicon-ok-circle" style="color: #08fa06"></i>');					
					var NuevoH1='<h1 id="Temp_'+d.IDSENSOR+'" class="no-margins" title="'+$('#Temp_'+d.IDSENSOR+'').attr('title')+'" >';
						NuevoH1+=$('#Temp_'+d.IDSENSOR+'').html()+'</h1>';
					
					$('#ParentTemp_'+d.IDSENSOR).html(NuevoH1);
				}
				else
				{
					$('#IconoSensor_'+d.IDSENSOR+'').html('<i class="glyphicon glyphicon-remove-circle parpadear" style="color: #fd0002"></i>');
					$('#Temp_'+d.IDSENSOR+'').css('color','#fd0002');
					$('#Temp_'+d.IDSENSOR+'').attr('class','no-margins parpadear');
				}
				
				if($("#Hora_"+d.IDSENSOR+"").html()!=d.HORA)
				{
					var IconoTendencia='';
					var ColorTendencia='';
					
										var IconoTendencia='';
					var ColorTendencia='';
					
					//Validando TENDENCIA en Iconos
					if(d.TENDENCIA=="=")
					{
						IconoTendencia='-';
						ColorTendencia='#f0ad4e';
					}
					//BAJA
					if(d.TENDENCIA=="-")
					{
						IconoTendencia='&#x2193;';
						ColorTendencia='#5cb85c';
					}
					//SUBE
					if(d.TENDENCIA=="+")
					{
						IconoTendencia='&#x2191;';
						ColorTendencia='#d9534f';
					}					
					//alert(TemperaturaAnterior+" VS "+TemperaturaActual+" --> "+IconoTendencia);
					
					$('#Temp_'+d.IDSENSOR+'').html(d.TEMPERATURA+'<span id="ICON_TENDENCIA_'+d.IDSENSOR+'" style="float: right; margin-left: -4px; margin-top: -4px;"></span>');
					$("#ICON_TENDENCIA_"+d.IDSENSOR+"").html(" "+IconoTendencia);
					$('#ICON_TENDENCIA_'+d.IDSENSOR+'').css('color',ColorTendencia);
					$("#Hora_"+d.IDSENSOR+"").html(d.HORA);					
					ParpadearActualizar("Temp_"+d.IDSENSOR+"");	
					ParpadearActualizar("Hora_"+d.IDSENSOR+"");	
				}
				//TEMP MINIMA
				if($("#TempMin_"+d.IDSENSOR+"").html()!=d.MINIMA)
				{
					$("#TempMin_"+d.IDSENSOR+"").html(d.MINIMA);				
					ParpadearActualizar("TempMin_"+d.IDSENSOR+"");
				}
				
				//TEMP MAXIMA
				if($("#TempMax_"+d.IDSENSOR+"").html()!=d.MAXIMA)
				{
					$("#TempMax_"+d.IDSENSOR+"").html(d.MAXIMA);				
					ParpadearActualizar("TempMax_"+d.IDSENSOR+"");
				}
				
				//HORA MINIMA
				if($("#HORA_MINIMA_"+d.IDSENSOR+"").html()!=d.HORA_MINIMA)
				{
					$("#HORA_MINIMA_"+d.IDSENSOR+"").html(d.HORA_MINIMA);					
					ParpadearActualizar("HORA_MINIMA_"+d.IDSENSOR+"");
				}
				
				//HORA MINIMA
				if($("#HORA_MAXIMA_"+d.IDSENSOR+"").html()!=d.HORA_MAXIMA)
				{
					$("#HORA_MAXIMA_"+d.IDSENSOR+"").html(d.HORA_MAXIMA);					
					ParpadearActualizar("HORA_MAXIMA_"+d.IDSENSOR+"");
				}
			}
			if(d.TIPO_SENSOR=="Electrico")
			{
				
				var Desde=$("#Desde_"+d.IDSENSOR+"").html()+"";
				var FechaHora=d.FECHA_HORA+"";
				
				if(Desde != FechaHora){
				
					var Alarma='#08fa06';
					
					if(d.ACCION=="Open")
					{
						Alarma='#fd0002';
					}
					
					var Icono='<i style="color: '+Alarma+'" class="glyphicon glyphicon-off"></i>';
					
					//Tr_Electrico_   ACCION
					$("#Estado_"+d.IDSENSOR+"").html(Icono);
					$("#Desde_"+d.IDSENSOR+"").html(d.FECHA_HORA);
					
					ParpadearActualizar("Estado_"+d.IDSENSOR+"");
					ParpadearActualizar("Desde_"+d.IDSENSOR+"");

				}
			}
		});
	});	
}
function ParpadearActualizar(Id_contenedor)
{
	$("#"+Id_contenedor+"").fadeOut(500);
	$("#"+Id_contenedor+"").fadeIn(500); 
	$("#"+Id_contenedor+"").fadeOut(500);
	$("#"+Id_contenedor+"").fadeIn(500); 
	$("#"+Id_contenedor+"").fadeOut(500);
	$("#"+Id_contenedor+"").fadeIn(500); 
}
function ParpadearAlarmaLocal()
{
	$(".parpadear").fadeOut(500);
	$(".parpadear").fadeIn(500); 
}