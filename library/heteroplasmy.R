args <- commandArgs(TRUE);
hp <- read.csv(args[1], header = T, sep = ";");

png(filename=args[2]);
plot(hp$SNP, hp$heteroplasmy, xlab = "SNP", ylab = "heterolasmy", type = "l");
dev.off();

pdf(file=args[3], width=8, height=4);
plot(hp$SNP, hp$heteroplasmy, xlab = "SNP", ylab = "heterolasmy", type = "l");
dev.off();