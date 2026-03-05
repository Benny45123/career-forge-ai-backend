pipeline{
    agent any
    environment {
        PORT           = credentials('port')
        MONGO_URI      = credentials('mongo_uri')
        SECRET_KEY     = credentials('secret_key')
        GEMINI_API_KEY = credentials('gemini_api_key')
        APP_EMAIL      = credentials('app_email')
        EMAIL_PASS     = credentials('email_pass')

        NODE_ENV = 'production'
    }
    stages{
        stage('Create .env File') {
    steps {
        // This creates a physical .env file in the workspace
        sh '''
            echo "PORT=${PORT}" > .env
            echo "MONGO_URI=${MONGO_URI}" >> .env
            echo "SECRET_KEY=${SECRET_KEY}" >> .env
            echo "GEMINI_API_KEY=${GEMINI_API_KEY}" >> .env
            echo "APP_EMAIL=${APP_EMAIL}" >> .env
            echo "EMAIL_PASS=${EMAIL_PASS}" >> .env
        '''
        echo "Physical .env file created for the build."
    }
    }
        stage('Checkout'){
            steps{
            echo 'Checking out code...'
            //checkout node version
            sh 'node -v'
            //checkout npm
            sh 'npm -v'
            }
        }
        stage('Install Dependencies'){
            steps{
            echo 'Installing dependencies...'
            sh 'npm install'
            }
        }
        stage('Run Build and Tests'){
            steps{
            echo 'Running build and tests...'
            //sh 'npm run build'
            //sh 'npm test'
            }
        }
        stage('Run Application'){
            steps{
            echo 'Running application...'
            sh 'node app.js'
            }
        }
    }
}