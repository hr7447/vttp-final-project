package vttp.batch5.groupb.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import vttp.batch5.groupb.project.model.Task;
import vttp.batch5.groupb.project.model.User;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendWelcomeEmail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@taskmanager.com");
        message.setTo(user.getEmail());
        message.setSubject("Welcome to Task Manager");
        message.setText(
            "Hello " + user.getUsername() + ",\n\n" +
            "Welcome to Task Manager! We're excited to have you on board.\n\n" +
            "With Task Manager, you can:\n" +
            "- Create and organize tasks\n" +
            "- Share tasks with other users\n" +
            "- Set categories for better organization\n" +
            "- Track task progress\n\n" +
            "If you have any questions, feel free to contact our support team.\n\n" +
            "Happy task managing!\n" +
            "The Task Manager Team"
        );
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
        }
    }

    public void sendTaskSharedEmail(User owner, User receiver, Task task) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@taskmanager.com");
        message.setTo(receiver.getEmail());
        message.setSubject("Task Shared With You");
        message.setText(
            "Hello " + receiver.getUsername() + ",\n\n" +
            owner.getUsername() + " has shared a task with you:\n\n" +
            "Task: " + task.getTitle() + "\n" +
            (task.getDescription() != null ? "Description: " + task.getDescription() + "\n" : "") +
            (task.getDueDate() != null ? "Due Date: " + 
                task.getDueDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) + "\n" : "") +
            "\nLog in to your Task Manager account to view the details and start collaborating.\n\n" +
            "Regards,\n" +
            "The Task Manager Team"
        );
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
        }
    }

    public void sendTaskReminderEmail(User user, Task task) {
        if (task.getDueDate() == null) {
            return;
        }
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@taskmanager.com");
        message.setTo(user.getEmail());
        message.setSubject("Reminder: Task Due Soon");
        message.setText(
            "Hello " + user.getUsername() + ",\n\n" +
            "This is a reminder for your task that is due soon:\n\n" +
            "Task: " + task.getTitle() + "\n" +
            (task.getDescription() != null ? "Description: " + task.getDescription() + "\n" : "") +
            "Due Date: " + task.getDueDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) + "\n\n" +
            "Log in to your Task Manager account to view and update the task.\n\n" +
            "Regards,\n" +
            "The Task Manager Team"
        );
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
        }
    }
} 