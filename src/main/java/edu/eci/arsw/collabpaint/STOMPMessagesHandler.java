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
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private AtomicInteger counter = new AtomicInteger(0);
    private Point[] points = new Point[4];

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        msgt.convertAndSend("/topic/newpoint"+numdibujo, pt);
        synchronized (points) {
            points[counter.get()] = pt;
        }
        counter.addAndGet(1);
        if (counter.get() == 4) {
            msgt.convertAndSend("/topic/newpolygon."+numdibujo, points);
            counter.set(0);
            points = new Point[4];
        }
    }
}
