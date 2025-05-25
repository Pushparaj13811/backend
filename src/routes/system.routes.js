import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generalLimiter } from '../utils/rate-limiter.js';
import os from 'os';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = Router();
const execAsync = promisify(exec);

// Get package.json version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));

// Health check route
router.get('/health', generalLimiter, async (req, res) => {
    try {
        const healthcheck = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: Date.now(),
            service: 'API',
            environment: process.env.NODE_ENV || 'development'
        };

        res.status(200).json({
            success: true,
            data: healthcheck
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Service Unavailable',
            error: error.message
        });
    }
});

// Git information route
router.get('/git', generalLimiter, async (req, res) => {
    try {
        const [branch, commit, lastCommit] = await Promise.all([
            execAsync('git rev-parse --abbrev-ref HEAD'),
            execAsync('git rev-parse HEAD'),
            execAsync('git log -1 --pretty=format:"%h - %an, %ar : %s"')
        ]);

        const gitInfo = {
            branch: branch.stdout.trim(),
            commit: commit.stdout.trim(),
            lastCommit: lastCommit.stdout.trim()
        };

        res.status(200).json({
            success: true,
            data: gitInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching git information',
            error: error.message
        });
    }
});

// System information route
router.get('/info', generalLimiter, async (req, res) => {
    try {
        // Get system information
        const systemInfo = {
            application: {
                name: 'API Service',
                version: packageJson.version,
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                uptime: process.uptime(),
                timestamp: Date.now()
            },
            system: {
                platform: os.platform(),
                arch: os.arch(),
                hostname: os.hostname(),
                type: os.type(),
                release: os.release(),
                cpus: os.cpus().length,
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                loadAverage: os.loadavg()
            },
            process: {
                pid: process.pid,
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
                uptime: process.uptime(),
                title: process.title,
                argv: process.argv,
                execPath: process.execPath
            },
            network: {
                interfaces: os.networkInterfaces()
            }
        };

        // Get git information if available
        try {
            const [branch, commit, lastCommit] = await Promise.all([
                execAsync('git rev-parse --abbrev-ref HEAD'),
                execAsync('git rev-parse HEAD'),
                execAsync('git log -1 --pretty=format:"%h - %an, %ar : %s"')
            ]);

            systemInfo.git = {
                branch: branch.stdout.trim(),
                commit: commit.stdout.trim(),
                lastCommit: lastCommit.stdout.trim()
            };
        } catch (error) {
            systemInfo.git = {
                error: 'Git information not available'
            };
        }

        // Get environment variables (excluding sensitive ones)
        systemInfo.environment = Object.entries(process.env)
            .filter(([key]) => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('PASSWORD'))
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

        res.status(200).json({
            success: true,
            data: systemInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching system information',
            error: error.message
        });
    }
});

export default router; 