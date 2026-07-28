import mongoose from 'mongoose';
import { connectDatabase } from '../../database/connection';
import { User } from '../../database/models/user.model';
import { Project } from '../../database/models/project.model';
import { Task, TaskStatus, TaskPriority } from '../../database/models/task.model';
import { TaskAuditLog } from '../../database/models/task-audit-log.model';
import { UserRole } from '../constants/user-role';

const seedDatabase = async (): Promise<void> => {
    try {
        console.log('Connecting to database for seeding...');
        await connectDatabase();

        // clear out existing collection data to ensure a clean slate
        console.log('Cleaning existing data...');
        await Promise.all([
            User.deleteMany({}),
            Project.deleteMany({}),
            Task.deleteMany({}),
            TaskAuditLog.deleteMany({}),
        ]);

        // passwords are plain text on purpose: the User model pre-save hook
        // hashes them (hashing here would double-hash and break login)
        console.log('Seeding users...');
        const [admin, member] = await User.create([
            {
                name: 'Eslam Ashraf',
                email: 'eslam@example.com',
                password: 'Admin@123',
                role: UserRole.ADMIN,
            },
            {
                name: 'Ahmed Mohamed',
                email: 'ahmed@example.com',
                password: 'Member@123',
                role: UserRole.MEMBER,
            },
        ]);

        // seed a project owned by the admin with the member added
        console.log('Seeding projects...');
        const project = await Project.create({
            name: 'Project 1',
            description: 'project seeded for testing',
            owner: admin._id,
            members: [member._id],
        });

        // seed tasks covering all three statuses
        console.log('Seeding tasks...');
        const tasks = await Task.create([
            {
                title: 'Task 1',
                description: 'task seeded for testing',
                status: TaskStatus.DONE,
                priority: TaskPriority.HIGH,
                dueDate: new Date('2026-07-15'),
                project: project._id,
                creator: admin._id,
                assignee: member._id,
            },
            {
                title: 'Task 2',
                description: 'task seeded for testing',
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.MEDIUM,
                dueDate: new Date('2026-08-01'),
                project: project._id,
                creator: admin._id,
                assignee: member._id,
            },
            {
                title: 'Task 3',
                description: 'task seeded for testing',
                status: TaskStatus.TODO,
                priority: TaskPriority.LOW,
                dueDate: new Date('2026-08-10'),
                project: project._id,
                creator: member._id,
                assignee: null,
            },
        ]);

        // seed the initial audit log entry for each task (fromStatus null on creation)
        console.log('Seeding audit logs...');
        await TaskAuditLog.create(
            tasks.map((task) => ({
                task: task._id,
                project: task.project,
                changedBy: task.creator,
                fromStatus: null,
                toStatus: task.status,
            }))
        );

        console.log('Database successfully seeded!');
        console.log('Test credentials:');
        console.log('Admin  -> eslam@example.com / Admin@123');
        console.log('Member -> ahmed@example.com / Member@123');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error during database seeding:', error);
        process.exit(1);
    }
};

seedDatabase();
