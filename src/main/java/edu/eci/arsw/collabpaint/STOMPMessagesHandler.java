package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicInteger;

@Controller
public class STOMPMessagesHandler{
        @Autowired
	SimpMessagingTemplate msgt;
        AtomicInteger cont = new AtomicInteger(0);
        Point[] points = new Point[4];
	@MessageMapping("/newpoint.{numdibujo}")    
	public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
            System.out.println("Nuevo punto recibido en el servidor!:"+pt);
            msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
            synchronized(points){
                points[cont.get()] = pt;
            }
            cont.addAndGet(1) ;
            if (cont.get()==4){
                msgt.convertAndSend("/topic/newpolygon."+numdibujo, points);
                cont = new AtomicInteger(0);
                points = new Point[4];
            }
	}
}
