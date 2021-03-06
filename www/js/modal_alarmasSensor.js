$(document).ready(function() {
	$("#btnGrabarBitacora").click(function(e) {
		e.preventDefault();
		$("#btnValidarIngresoBitacora").trigger("click");
		if(formularioIngresoBitacora.checkValidity()){
			GuardarBitacora();
		}
	});
	$("#ModalCargandoAlarma").load("html_parts/modal_cargando.html");
});
function RecargarTablaAlarmas()
{		
	var divProblemas2=$('#PanelBodyTablaDatosAlarma').find('.dataTables_scrollHeadInner');		
	$(divProblemas2).css('width','100%');
	
	var tablaProblemas2=$(divProblemas2).find('table');
	$(tablaProblemas2).css('width','100%');
	$(tablaProblemas2).attr('style','margin-left: 0px; width: 100%; margin-bottom: -2px;');
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
		
		var Scrool=$("#txtcomentario_bitacora").offset().top;
		
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
				CK			: getCK()
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